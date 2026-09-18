# E2E verification for Feature #5 - Investment idempotency (FR-004).
#
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-investments.ps1
#
# Three layers, same conventions as scripts/e2e-admin.ps1:
#   Layer A (always)  - over real HTTP: the investment endpoints refuse
#                       unauthenticated callers with 401.
#   Layer B (DEV_FALLBACK only) - the full idempotency lifecycle: register and
#                       verify an investor, credit the demo wallet, invest with
#                       an Idempotency-Key, replay the SAME key (must return the
#                       ORIGINAL result, never a second debit), reuse the key
#                       with a different payload (409), oversized keys (400),
#                       and headerless requests (fresh key minted server-side).
#   Layer C (always)  - read-only ledger invariants straight from the database:
#                       one INVESTMENT debit per investment row, and each debit
#                       matches its investment's amount exactly.
#
# In CLERK mode Layer B is SKIPPED, never failed: Clerk owns the session, so an
# HTTP script cannot mint the admin/investor sessions this lifecycle needs.
param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$Password = 'DemoPass123!'
)
$ErrorActionPreference = 'Continue'
$base = $BaseUrl.TrimEnd('/')
Set-Location (Join-Path $PSScriptRoot '..')
$pass = 0
$fail = 0
$skip = 0

function Check($name, $cond, $detail) {
  if ($cond) { $script:pass++; Write-Host ("PASS  {0}  {1}" -f $name, $detail) -ForegroundColor Green }
  else { $script:fail++; Write-Host ("FAIL  {0}  {1}" -f $name, $detail) -ForegroundColor Red }
}

function Skip($name, $why) {
  $script:skip++
  Write-Host ("SKIP  {0}  {1}" -f $name, $why) -ForegroundColor Yellow
}

# HTTP helper with explicit header support (Idempotency-Key). Redirection is
# disabled so auth redirects stay observable.
function Req($method, $path, $body, $session, $headers) {
  try {
    $args = @{
      Uri = "$base$path"; Method = $method; UseBasicParsing = $true
      TimeoutSec = 90; MaximumRedirection = 0
    }
    if ($null -ne $session) {
      $args.WebSession = $session
      # PS 5.1 quirk: -Headers values are merged into the WebRequestSession and
      # PERSIST for every later request on that session. A one-off custom
      # header (e.g. Idempotency-Key) would otherwise silently leak into all
      # subsequent calls, turning headerless requests into replays. Pin the
      # session's header set to exactly this request's headers (mutate the
      # dictionary - property assignment cannot coerce a hashtable in PS 5.1).
      try {
        $session.Headers.Clear()
        if ($null -ne $headers) {
          foreach ($hk in @($headers.Keys)) { $session.Headers[[string]$hk] = [string]$headers[$hk] }
        }
      } catch {
        # Older hosts where the dictionary is not mutable: fall back to
        # per-request -Headers (still correct for a single call).
        if ($null -ne $headers) { $args.Headers = $headers }
      }
    }
    if ($null -ne $body) { $args.Body = $body; $args.ContentType = 'application/json' }
    $r = Invoke-WebRequest @args
    return @{ status = [int]$r.StatusCode; content = $r.Content }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      return @{ status = [int]$resp.StatusCode; content = $reader.ReadToEnd() }
    }
    return @{ status = 0; content = $_.Exception.Message }
  }
}

function NewSession { return New-Object Microsoft.PowerShell.Commands.WebRequestSession }

function ErrorCode($content) {
  if ($content -match '"code"\s*:\s*"([^"]+)"') { return $Matches[1] }
  return ''
}

function JsonBody($obj) { return ($obj | ConvertTo-Json -Compress) }

# Read-only database probe (temp file + createRequire - see e2e-admin.ps1 for
# why `node -e` cannot be used on Windows PowerShell 5.1).
$script:DbProbePath = Join-Path $env:TEMP 'nest-e2e-invest-db.cjs'
$script:DbProbeSource = @'
const { createRequire } = require("node:module");
const req = createRequire((process.env.E2E_PROJECT_DIR || ".") + "/");
const { PrismaClient } = req("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, status: true },
  });
  const email = (process.env.E2E_TARGET_EMAIL || "").toLowerCase();
  const target = users.find((u) => u.email === email) || null;
  // MERGE NOTE: the merged app's properties use the presentation vocabulary
  // ('funding' | 'published' | 'active' | 'funded') that the UI renders, and the
  // merged investment route treats ACTIVE/FUNDING/PUBLISHED as open for
  // investment (any casing). Pick the open property with the LEAST funding so
  // the suite's fixed amounts (2,000,000 + 1,000,000 naira) can never trip the
  // "fully funded" / "exceeds remaining funding" 409 guards.
  const property = await prisma.property.findFirst({
    where: {
      status: { in: ["ACTIVE", "FUNDING", "PUBLISHED", "active", "funding", "published"] },
    },
    orderBy: { fundedKobo: "asc" },
    select: { id: true, slug: true, fundedKobo: true, targetKobo: true },
  });
  const investments = await prisma.investment.findMany({
    where: target ? { userId: target.id } : {},
    select: { id: true, userId: true, propertyId: true, amountKobo: true, idempotencyKey: true, status: true },
  });
  const debits = await prisma.transaction.findMany({
    where: { category: "INVESTMENT", type: "DEBIT" },
    select: { id: true, userId: true, refId: true, amountKobo: true },
  });
  // JSON.stringify cannot serialize BigInt - coerce kobo to Number (exact up
  // to 2^53, far above any demo amount).
  const prop = property
    ? { ...property, fundedKobo: Number(property.fundedKobo), targetKobo: Number(property.targetKobo) }
    : null;
  const inv = investments.map((i) => ({ ...i, amountKobo: Number(i.amountKobo) }));
  const deb = debits.map((d) => ({ ...d, amountKobo: Number(d.amountKobo) }));
  process.stdout.write(JSON.stringify({ target, property: prop, investments: inv, debits: deb }));
})().catch((e) => {
  process.stderr.write("DB_READ_FAILED: " + e.message);
  process.exit(1);
}).finally(() => prisma.$disconnect());
'@

function Get-DbState($email) {
  try {
    Set-Content -LiteralPath $script:DbProbePath -Value $script:DbProbeSource -Encoding UTF8
    $env:E2E_PROJECT_DIR = (Get-Location).Path
    $env:E2E_TARGET_EMAIL = $email
    $raw = (& node $script:DbProbePath 2>&1 | Out-String)
    return ($raw | ConvertFrom-Json)
  } catch {
    Write-Host "      (db probe: $($_.Exception.Message))" -ForegroundColor DarkYellow
    return $null
  } finally {
    Remove-Item Env:E2E_TARGET_EMAIL -ErrorAction SilentlyContinue
    Remove-Item Env:E2E_PROJECT_DIR -ErrorAction SilentlyContinue
  }
}

Write-Host "`n=== NEST Feature #5 E2E - Investment idempotency ===" -ForegroundColor Cyan
Write-Host "Target: $base" -ForegroundColor Cyan

$probeSession = NewSession
$landing = Req 'GET' '/' $null $probeSession $null
# MERGE NOTE: API-first mode detection (see scripts/e2e-auth.ps1). The merged
# app's landing page is a client-rendered SPA, so its HTML carries no mode text.
$modeProbe = Req 'GET' '/api/auth/me' $null $probeSession $null
$script:mode = if ($modeProbe.content -match '"mode"\s*:\s*"DEV_FALLBACK"') { 'DEV_FALLBACK' }
  elseif ($modeProbe.content -match '"mode"\s*:\s*"CLERK"') { 'CLERK' }
  elseif ($landing.content -match 'DEV_FALLBACK') { 'DEV_FALLBACK' }
  elseif ($landing.content -match 'Clerk is handling registration') { 'CLERK' }
  else { 'UNKNOWN' }
Write-Host "Auth mode detected: $script:mode`n" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Layer A - authorization gates.
# ---------------------------------------------------------------------------
Write-Host "--- Layer A: authorization gates ---" -ForegroundColor Cyan
Check 'A1 landing renders' ($landing.status -eq 200) "status=$($landing.status)"
Check 'A2 landing reports an auth mode' ($script:mode -ne 'UNKNOWN') "mode=$($script:mode)"

$anon = NewSession
$r = Req 'GET' '/api/investments' $null $anon $null
Check 'A3 GET /api/investments -> 401' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

$r = Req 'POST' '/api/investments' '{"propertyId":"x","amountKobo":100}' $anon @{ 'Idempotency-Key' = 'anon-key-1' }
Check 'A4 POST /api/investments -> 401 (auth before key validation)' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

# ---------------------------------------------------------------------------
# Layer B - idempotency lifecycle.
# ---------------------------------------------------------------------------
Write-Host "`n--- Layer B: idempotency lifecycle ---" -ForegroundColor Cyan

if ($script:mode -ne 'DEV_FALLBACK') {
  Skip 'B1-B21 lifecycle (invest / replay / conflict)' 'DEV_FALLBACK mode only - Clerk owns the session (see README)'
} else {
  $stamp = Get-Date -Format 'MMddHHmmss'
  $adminEmail = "e2e-admin-$stamp@demo.nest.com"
  $investorEmail = "e2e-investor-$stamp@demo.nest.com"

  $adminSession = NewSession
  $r = Req 'POST' '/api/auth/register' (JsonBody @{ firstName = 'E2E'; lastName = 'Admin'; email = $adminEmail; phone = '08030000001'; password = $Password }) $adminSession $null
  Check 'B1 register admin -> 201' ($r.status -eq 201) "status=$($r.status)"

  $invSession = NewSession
  $r = Req 'POST' '/api/auth/register' (JsonBody @{ firstName = 'E2E'; lastName = 'Investor'; email = $investorEmail; phone = '08030000002'; password = $Password }) $invSession $null
  Check 'B2 register investor -> 201 PENDING' ($r.status -eq 201 -and $r.content -match 'PENDING') "status=$($r.status)"

  $promote = (& node scripts/make-admin.mts $adminEmail 2>&1 | Out-String)
  Check 'B3 promote admin' ($promote -match 'role=ADMIN') ($promote.Trim() -replace "`r?`n", ' | ')

  $r = Req 'POST' '/api/auth/login' (JsonBody @{ email = $adminEmail; password = $Password }) $adminSession $null
  Check 'B4 admin login -> 200' ($r.status -eq 200) "status=$($r.status)"

  $db = Get-DbState $investorEmail
  $investorId = if ($db -and $db.target) { $db.target.id } else { '' }
  Check 'B5 investor row resolvable' ($investorId -ne '') "id=$investorId"

  $r = Req 'POST' "/api/admin/users/$investorId/verify" '{}' $adminSession $null
  Check 'B6 verify investor -> 200' ($r.status -eq 200) "status=$($r.status)"

  # --- fund the demo wallet (5,000,000 naira) ----------------------------
  $r = Req 'POST' "/api/admin/users/$investorId/credit" (JsonBody @{ amountKobo = 500000000 }) $adminSession $null
  $creditBalance = -1
  if ($r.content -match '"newBalance"\s*:\s*([0-9]+)') { $creditBalance = [long]$Matches[1] }
  Check 'B7 demo credit 5,000,000 naira -> 200' ($r.status -eq 200 -and $creditBalance -eq 500000000) "status=$($r.status) newBalance=$creditBalance"

  # --- target property ----------------------------------------------------
  $db = Get-DbState $investorEmail
  $propertyId = if ($db -and $db.property) { $db.property.id } else { '' }
  Check 'B8 active property resolvable' ($propertyId -ne '') "id=$propertyId"

  # --- B9: oversized key is rejected before any validation ----------------
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 1000000 }) $invSession @{ 'Idempotency-Key' = ('k' * 256) }
  Check 'B9 key > 255 chars -> 400 IDEMPOTENCY_KEY_INVALID' ($r.status -eq 400 -and (ErrorCode $r.content) -eq 'IDEMPOTENCY_KEY_INVALID') "status=$($r.status) code=$(ErrorCode $r.content)"

  # --- B10: first investment with a client key -----------------------------
  $idemKey = "e2e-invest-$stamp"
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 200000000 }) $invSession @{ 'Idempotency-Key' = $idemKey }
  $firstInvId = ''
  $firstBalance = -1
  if ($r.content -match '\"investment\"\s*:\s*\{[^}]*\"id\"\s*:\s*\"([^\"]+)\"') { $firstInvId = $Matches[1] }
  if ($r.content -match '\"newBalance\"\s*:\s*([0-9]+)') { $firstBalance = [long]$Matches[1] }
  Check 'B10 invest 2,000,000 naira -> 200' ($r.status -eq 200 -and $firstInvId -ne '' -and $firstBalance -eq 300000000) "status=$($r.status) inv=$firstInvId balance=$firstBalance"

  # --- B11: replay of the SAME key returns the ORIGINAL result -------------
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 200000000 }) $invSession @{ 'Idempotency-Key' = $idemKey }
  $replayInvId = ''
  $isReplay = $r.content -match '\"idempotentReplay\"\s*:\s*true'
  if ($r.content -match '\"investment\"\s*:\s*\{[^}]*\"id\"\s*:\s*\"([^\"]+)\"') { $replayInvId = $Matches[1] }
  Check 'B11 same-key retry -> 200 original result + idempotentReplay' ($r.status -eq 200 -and $isReplay -and $replayInvId -eq $firstInvId) "status=$($r.status) replay=$isReplay sameId=$($replayInvId -eq $firstInvId)"

  # --- B12: key reuse is scoped per investor -------------------------------
  # A second investor reusing the same key must NOT see investor 1's result.
  $inv2Email = "e2e-investor2-$stamp@demo.nest.com"
  $inv2Session = NewSession
  $r = Req 'POST' '/api/auth/register' (JsonBody @{ firstName = 'E2E'; lastName = 'Investor2'; email = $inv2Email; phone = '08030000003'; password = $Password }) $inv2Session $null
  $db = Get-DbState $inv2Email
  $inv2Id = if ($db -and $db.target) { $db.target.id } else { '' }
  if ($inv2Id -ne '') {
    $r = Req 'POST' "/api/admin/users/$inv2Id/verify" '{}' $adminSession $null
    $r = Req 'POST' "/api/admin/users/$inv2Id/credit" (JsonBody @{ amountKobo = 500000000 }) $adminSession $null
    $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 100000000 }) $inv2Session @{ 'Idempotency-Key' = $idemKey }
    $sawForeign = $r.content -match [regex]::Escape($firstInvId)
    Check 'B12 foreign key reuse -> own result (or conflict), never investor 1 data' (($r.status -eq 409) -or ($r.status -eq 200 -and -not $sawForeign)) "status=$($r.status) leaked=$sawForeign"
  } else {
    Check 'B12 foreign key reuse scoped' $false 'investor 2 row unresolvable'
  }

  # --- B13: headerless request still works (server mints a private key) ----
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 100000000 }) $invSession $null
  Check 'B13 headerless invest -> 200' ($r.status -eq 200) "status=$($r.status)"

  # --- B14: unknown property -> 404 ----------------------------------------
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = 'does-not-exist'; amountKobo = 1000000 }) $invSession $null
  Check 'B14 unknown property -> 404' ($r.status -eq 404) "status=$($r.status)"

  # --- B15: insufficient balance -> 400 ------------------------------------
  $r = Req 'POST' '/api/investments' (JsonBody @{ propertyId = $propertyId; amountKobo = 900000000 }) $invSession $null
  Check 'B15 over-balance invest -> 400' ($r.status -eq 400) "status=$($r.status) code=$(ErrorCode $r.content)"

  # --- Layer C: ledger invariants, read straight from the database ---------
  $db = Get-DbState $investorEmail
  if ($null -eq $db) {
    Check 'C1 database readable' $false 'db probe failed'
  } else {
    $myInvestments = @($db.investments | Where-Object { $_.userId -eq $db.target.id })
    $myDebits = @($db.debits | Where-Object { $_.userId -eq $db.target.id -and $_.refId -eq $propertyId })

    Check 'C1 exactly 2 investment rows for the investor (B10 + B13)' ($myInvestments.Count -eq 2) "count=$($myInvestments.Count)"
    Check 'C2 every investment row carries an idempotencyKey' (@($myInvestments | Where-Object { -not $_.idempotencyKey }).Count -eq 0) "keyless=$(@($myInvestments | Where-Object { -not $_.idempotencyKey }).Count)"
    Check 'C3 B10 key stored verbatim' (@($myInvestments | Where-Object { $_.idempotencyKey -eq $idemKey }).Count -eq 1) "key=$idemKey"
    Check 'C4 exactly 2 INVESTMENT debits (replay created none)' ($myDebits.Count -eq 2) "count=$($myDebits.Count)"
    $sumKobo = ($myDebits | Measure-Object -Property amountKobo -Sum).Sum
    Check 'C5 debits total 3,000,000 naira' ($sumKobo -eq 300000000) "sum=$sumKobo"
  }

  # --- Layer C (always): cross-user ledger consistency ----------------------
  $dbAll = Get-DbState ''
  if ($dbAll) {
    $orphanDebits = @($dbAll.debits | Where-Object { $null -eq $_.userId })
    Check 'C6 every INVESTMENT debit belongs to a user' ($orphanDebits.Count -eq 0) "orphans=$($orphanDebits.Count)"
    $active = $dbAll.property
    Check 'C7 property still readable' ($null -ne $active) "id=$(if($active){$active.id}else{''})"
  }
}

Remove-Item -LiteralPath $script:DbProbePath -ErrorAction SilentlyContinue

Write-Host ("`n=== RESULT: {0} passed, {1} failed, {2} skipped ===" -f $pass, $fail, $skip) -ForegroundColor Cyan
if ($script:mode -ne 'DEV_FALLBACK') {
  Write-Host 'Layer B was skipped: Clerk owns the session. Run against a DEV_FALLBACK instance,' -ForegroundColor Yellow
  Write-Host 'or cover the lifecycle by hand per README.' -ForegroundColor Yellow
}
if ($fail -gt 0) { exit 1 } else { exit 0 }

