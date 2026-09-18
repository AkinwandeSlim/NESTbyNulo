# E2E verification for Feature #2 (Admin Manual Verification / Screen 7).
#
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-admin.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-admin.ps1 -BaseUrl http://localhost:3101
#
# Three layers:
#   Layer A (always)  - over real HTTP: every admin API returns 401 when
#                       unauthenticated, and every /admin page redirects to
#                       /sign-in. Asserts the landing page's auth-mode marker.
#   Layer B (DEV_FALLBACK only) - the whole Screen 7 lifecycle: register an
#                       investor, prove the 403 gate while PENDING, promote an
#                       admin, verify (and prove idempotency), reject with a
#                       reason, unverify, plus every 400/404/409 branch.
#   Layer C (always)  - read-only data-integrity invariants on the database
#                       (status columns must agree with verifiedAt/rejectedAt).
#
# In CLERK mode Layer B is SKIPPED, never failed: Clerk owns the session, so an
# HTTP script cannot mint an admin session, and the fallback register/login
# endpoints correctly refuse with 403 (registration is never dual-written).
# README -> "Manual verification (Feature #2)" lists the browser steps to cover
# Layer B by hand while the app runs against Clerk.
param(
  [string]$BaseUrl = 'http://localhost:3000',
  [string]$AdminEmail = '',
  [string]$Password = 'DemoPass123!'
)
$ErrorActionPreference = 'Continue'
$base = $BaseUrl.TrimEnd('/')
# Run from the project root so `node -e` resolves @prisma/client from the local
# node_modules and Prisma picks up .env.
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

# Single HTTP helper. Redirection is disabled so a 307 to /sign-in is observable
# instead of being followed into a 200 sign-in page.
function Req($method, $path, $body, $session) {
  $url = "$base$path"
  try {
    $args = @{
      Uri = $url; Method = $method; UseBasicParsing = $true
      TimeoutSec = 90; MaximumRedirection = 0
    }
    if ($null -ne $session) { $args.WebSession = $session }
    if ($null -ne $body) { $args.Body = $body; $args.ContentType = 'application/json' }
    $r = Invoke-WebRequest @args
    return @{ status = [int]$r.StatusCode; content = $r.Content; location = [string]$r.Headers['Location'] }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      return @{
        status = [int]$resp.StatusCode
        content = $reader.ReadToEnd()
        location = [string]$resp.Headers['Location']
      }
    }
    return @{ status = 0; content = $_.Exception.Message; location = '' }
  }
}

function NewSession { return New-Object Microsoft.PowerShell.Commands.WebRequestSession }

# Pulls the machine-readable "error" code out of a response body, so assertions
# can name the exact denial branch instead of only the status code.
function ErrorCode($content) {
  # Prefer the machine-readable "code" field (Feature #5 responses carry a
  # human "error" message alongside it); fall back to "error" for the
  # Feature #2 endpoints whose error value IS the code.
  if ($content -match '"code"\s*:\s*"([^"]+)"') { return $Matches[1] }
  if ($content -match '"error"\s*:\s*"([^"]+)"') { return $Matches[1] }
  return ''
}

function JsonBody($obj) { return ($obj | ConvertTo-Json -Compress) }

# ---------------------------------------------------------------------------
# Read-only database probe used by Layer B (audit counts) and Layer C (state
# invariants). Two Windows-isms force this shape:
#   * `node -e "<code>"` is unusable from Windows PowerShell 5.1 - the native
#     argument parser strips embedded double quotes and Node sees a syntax
#     error. So the reader is written to a temp file and executed by path.
#   * a temp file lives outside the project, so `require("@prisma/client")`
#     cannot walk up to node_modules; createRequire() pins resolution to the
#     project directory instead.
# The target email travels through the environment (never interpolated into
# source), so no value can break out of the script.
$script:DbProbePath = Join-Path $env:TEMP 'nest-e2e-admin-db.cjs'

$script:DbProbeSource = @'
const { createRequire } = require("node:module");
const req = createRequire((process.env.E2E_PROJECT_DIR || ".") + "/");
const { PrismaClient } = req("@prisma/client");
const prisma = new PrismaClient();
(async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, role: true, status: true,
      verifiedAt: true, rejectedAt: true, rejectedBy: true, rejectionReason: true,
    },
  });
  const email = (process.env.E2E_TARGET_EMAIL || "").toLowerCase();
  const target = users.find((u) => u.email === email) || null;
  let audits = [];
  if (target) {
    const logs = await prisma.auditLog.findMany({
      where: { userId: target.id },
      select: { action: true },
    });
    const counts = {};
    for (const l of logs) counts[l.action] = (counts[l.action] || 0) + 1;
    audits = Object.keys(counts).map((action) => ({ action, count: counts[action] }));
  }
  process.stdout.write(JSON.stringify({ users, target, audits }));
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

# ---------------------------------------------------------------------------
# Mode auto-detection: the landing page footer prints the active auth mode,
# exactly as scripts/e2e-auth.ps1 does.
# ---------------------------------------------------------------------------
Write-Host "`n=== NEST Feature #2 E2E - Admin Manual Verification ===" -ForegroundColor Cyan
Write-Host "Target: $base" -ForegroundColor Cyan

$probe = NewSession
$landing = Req 'GET' '/' $null $probe
# MERGE NOTE: API-first mode detection (see scripts/e2e-auth.ps1); the merged
# app's landing page is a client-rendered SPA with no mode text in its HTML.
$modeProbe = Req 'GET' '/api/auth/me' $null $probe
$script:mode = if ($modeProbe.content -match '"mode"\s*:\s*"DEV_FALLBACK"') { 'DEV_FALLBACK' }
  elseif ($modeProbe.content -match '"mode"\s*:\s*"CLERK"') { 'CLERK' }
  elseif ($landing.content -match 'DEV_FALLBACK') { 'DEV_FALLBACK' }
  elseif ($landing.content -match 'Clerk is handling registration') { 'CLERK' }
  else { 'UNKNOWN' }
Write-Host "Auth mode detected: $script:mode`n" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Layer A - authorization gates (mode-independent; this is the security core).
# ---------------------------------------------------------------------------
Write-Host "--- Layer A: authorization gates ---" -ForegroundColor Cyan

Check 'A1 landing renders' ($landing.status -eq 200) "status=$($landing.status)"
Check 'A2 landing reports an auth mode' ($script:mode -ne 'UNKNOWN') "mode=$($script:mode)"

$anon = NewSession

$r = Req 'GET' '/api/admin/users' $null $anon
Check 'A3 GET /api/admin/users -> 401' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

$r = Req 'GET' '/api/admin/users?status=PENDING' $null $anon
Check 'A4 GET /api/admin/users?status -> 401' ($r.status -eq 401) "status=$($r.status)"

$r = Req 'GET' '/api/admin/stats' $null $anon
Check 'A5 GET /api/admin/stats -> 401' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

$r = Req 'POST' '/api/admin/users/no-such-id/verify' $null $anon
Check 'A6 POST verify -> 401 (auth before lookup)' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

$r = Req 'POST' '/api/admin/users/no-such-id/reject' '{"reason":"a sufficiently long reason"}' $anon
Check 'A7 POST reject -> 401 (auth before validation)' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

$r = Req 'POST' '/api/admin/users/no-such-id/unverify' $null $anon
Check 'A8 POST unverify -> 401' ($r.status -eq 401) "status=$($r.status) code=$(ErrorCode $r.content)"

# Every /admin page must bounce to sign-in instead of rendering the shell.
foreach ($page in @('/admin', '/admin/crm', '/admin/support', '/admin/analytics', '/admin/finance', '/admin/opportunities', '/admin/properties')) {
  $r = Req 'GET' $page $null $anon
  $isRedirect = ($r.status -eq 307 -or $r.status -eq 302 -or $r.status -eq 303)
  $toSignIn = $r.location -match '/sign-in'
  Check "A9 $page redirects to sign-in" ($isRedirect -and $toSignIn) "status=$($r.status) location=$($r.location)"
}

# ---------------------------------------------------------------------------
# Layer B - the Screen 7 lifecycle. Needs cookie-based sessions, so it only runs
# in DEV_FALLBACK mode; in Clerk mode the same steps are done in the browser.
# ---------------------------------------------------------------------------
Write-Host "`n--- Layer B: admin verification lifecycle ---" -ForegroundColor Cyan

if ($script:mode -ne 'DEV_FALLBACK') {
  Skip 'B1-B33 lifecycle (verify / reject / unverify)' 'DEV_FALLBACK mode only - Clerk owns the session, so an HTTP script cannot mint an admin session (see README)'
} else {
  $stamp = Get-Date -Format 'MMddHHmmss'
  $adminEmail = if ($AdminEmail) { $AdminEmail } else { "e2e-admin-$stamp@demo.nest.com" }
  $investorEmail = "e2e-investor-$stamp@demo.nest.com"

  # --- accounts -----------------------------------------------------------
  $adminSession = NewSession
  $body = JsonBody @{ firstName = 'E2E'; lastName = 'Admin'; email = $adminEmail; phone = '08030000001'; password = $Password }
  $r = Req 'POST' '/api/auth/register' $body $adminSession
  Check 'B1 register admin account -> 201' ($r.status -eq 201) "status=$($r.status) email=$adminEmail"

  $invSession = NewSession
  $body = JsonBody @{ firstName = 'E2E'; lastName = 'Investor'; email = $investorEmail; phone = '08030000002'; password = $Password }
  $r = Req 'POST' '/api/auth/register' $body $invSession
  Check 'B2 register investor -> 201 PENDING' ($r.status -eq 201 -and $r.content -match 'PENDING') "status=$($r.status)"

  # Verification gate starts closed.
  $r = Req 'GET' '/api/investments' $null $invSession
  Check 'B3 investor gate 403 while PENDING' ($r.status -eq 403 -and (ErrorCode $r.content) -eq 'ACCOUNT_PENDING') "status=$($r.status) code=$(ErrorCode $r.content)"

  # --- promote + sign in --------------------------------------------------
  $promote = (& node scripts/make-admin.mts $adminEmail 2>&1 | Out-String)
  Check 'B4 promote admin via make-admin' ($promote -match 'role=ADMIN') ($promote.Trim() -replace "`r?`n", ' | ')

  $r = Req 'POST' '/api/auth/login' (JsonBody @{ email = $adminEmail; password = $Password }) $adminSession
  $adminId = ''
  if ($r.status -eq 200 -and $r.content -match '"id"\s*:\s*"([^"]+)"') { $adminId = $Matches[1] }
  Check 'B5 admin login -> 200' ($r.status -eq 200 -and $adminId -ne '') "status=$($r.status)"

  # Preflight guard. sessionCookieOptions() marks the session cookie Secure when
  # NODE_ENV=production, and an HTTP test client will silently drop it - which
  # otherwise shows up as ~26 confusing 401s instead of one clear message.
  $sessionLanded = $false
  try {
    $sessionLanded = @($adminSession.Cookies.GetCookies($base) | ForEach-Object { $_.Name }) -contains 'nest_dev_session'
  } catch { $sessionLanded = $false }

  if (-not $sessionLanded) {
    Skip 'B6-B33 authenticated lifecycle' 'session cookie not stored - this target is probably running production (next start), where the cookie is Secure and will not travel over http. Test against `npm run dev`.'
  } else {

  # --- queue + stats ------------------------------------------------------
  $r = Req 'GET' '/api/admin/users' $null $adminSession
  Check 'B6 admin GET /api/admin/users -> 200' ($r.status -eq 200) "status=$($r.status) code=$(ErrorCode $r.content)"
  $list = $null
  try { $list = $r.content | ConvertFrom-Json } catch { $list = $null }

  $invRow = $null
  if ($list -and $list.users) { $invRow = @($list.users | Where-Object { $_.email -eq $investorEmail })[0] }
  $invId = if ($invRow) { $invRow.id } else { '' }
  Check 'B7 new investor appears in the queue as PENDING' ($null -ne $invRow -and $invRow.status -eq 'PENDING') "id=$invId status=$($invRow.status)"
  Check 'B8 row contract exposes rejectionReason' ($null -ne $invRow -and ($invRow.PSObject.Properties.Name -contains 'rejectionReason')) "value=$($invRow.rejectionReason)"

  $adminInQueue = $null
  if ($list -and $list.users) { $adminInQueue = @($list.users | Where-Object { $_.email -eq $adminEmail })[0] }
  Check 'B9 admin accounts excluded from the queue' ($null -eq $adminInQueue) 'role filter = INVESTOR only'

  $r = Req 'GET' '/api/admin/users?status=BOGUS' $null $adminSession
  Check 'B10 invalid status -> 400 INVALID_STATUS' ($r.status -eq 400 -and (ErrorCode $r.content) -eq 'INVALID_STATUS') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'GET' '/api/admin/users?status=PENDING' $null $adminSession
  Check 'B11 status filter returns only PENDING' ($r.status -eq 200 -and $r.content -notmatch '"status":"(VERIFIED|REJECTED)"') "status=$($r.status)"

  $r = Req 'GET' '/api/admin/stats' $null $adminSession
  $stats = $null
  if ($r.status -eq 200) { try { $stats = ($r.content | ConvertFrom-Json).stats } catch { $stats = $null } }
  $statsOk = $null -ne $stats -and $null -ne $stats.totalInvestors -and $null -ne $stats.verified -and $null -ne $stats.rejected -and $null -ne $stats.admins -and $null -ne $stats.pending -and $null -ne $stats.registeredToday
  Check 'B12 admin stats -> 200 with all 6 aggregates' ($r.status -eq 200 -and $statsOk) "status=$($r.status)"

  # --- non-admin is refused ----------------------------------------------
  $r = Req 'GET' '/api/admin/users' $null $invSession
  Check 'B13 investor -> 403 FORBIDDEN on admin list' ($r.status -eq 403 -and (ErrorCode $r.content) -eq 'FORBIDDEN') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'POST' "/api/admin/users/$invId/verify" $null $invSession
  Check 'B14 investor cannot call verify -> 403' ($r.status -eq 403 -and (ErrorCode $r.content) -eq 'FORBIDDEN') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'GET' '/admin/crm' $null $invSession
  Check 'B15 non-admin sees the 403 card, not the shell' ($r.status -eq 200 -and $r.content -match 'Admin access required') "status=$($r.status)"

  # --- argument validation + missing targets ------------------------------
  $r = Req 'POST' "/api/admin/users/$invId/reject" '{"reason":"short"}' $adminSession
  Check 'B16 reject reason <10 chars -> 400 INVALID_REASON' ($r.status -eq 400 -and (ErrorCode $r.content) -eq 'INVALID_REASON') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'POST' "/api/admin/users/$invId/reject" '{}' $adminSession
  Check 'B17 reject with no reason -> 400' ($r.status -eq 400 -and (ErrorCode $r.content) -eq 'INVALID_REASON') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'POST' '/api/admin/users/does-not-exist/verify' $null $adminSession
  Check 'B18 verify unknown id -> 404 NOT_FOUND' ($r.status -eq 404 -and (ErrorCode $r.content) -eq 'NOT_FOUND') "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'POST' '/api/admin/users/does-not-exist/unverify' $null $adminSession
  Check 'B19 unverify unknown id -> 404 NOT_FOUND' ($r.status -eq 404 -and (ErrorCode $r.content) -eq 'NOT_FOUND') "status=$($r.status) code=$(ErrorCode $r.content)"

  # --- the real transitions ----------------------------------------------
  $r = Req 'POST' "/api/admin/users/$invId/verify" $null $adminSession
  Check 'B20 verify -> 200 alreadyVerified=false' ($r.status -eq 200 -and $r.content -match '"alreadyVerified":false') "status=$($r.status)"

  $r = Req 'GET' '/api/investments' $null $invSession
  Check 'B21 gate OPENS for the verified investor' ($r.status -eq 200) "status=$($r.status) code=$(ErrorCode $r.content)"

  $r = Req 'POST' "/api/admin/users/$invId/verify" $null $adminSession
  Check 'B22 re-verify is idempotent (alreadyVerified=true)' ($r.status -eq 200 -and $r.content -match '"alreadyVerified":true') "status=$($r.status)"

  $reason = 'KYC documents could not be verified'
  $r = Req 'POST' "/api/admin/users/$invId/reject" (JsonBody @{ reason = $reason }) $adminSession
  Check 'B23 reject -> 200 and echoes the reason' ($r.status -eq 200 -and $r.content -match [regex]::Escape($reason)) "status=$($r.status)"

  $r = Req 'GET' '/api/investments' $null $invSession
  Check 'B24 rejected investor -> 403 ACCOUNT_REJECTED' ($r.status -eq 403 -and (ErrorCode $r.content) -eq 'ACCOUNT_REJECTED') "status=$($r.status) code=$(ErrorCode $r.content)"
  Check 'B25 rejection reason is surfaced to the investor' ($r.content -match [regex]::Escape($reason)) 'investor learns why'

  $r = Req 'POST' "/api/admin/users/$invId/unverify" $null $adminSession
  Check 'B26 unverify -> 200 status=PENDING' ($r.status -eq 200 -and $r.content -match '"status":"PENDING"') "status=$($r.status)"

  $r = Req 'GET' '/api/investments' $null $invSession
  Check 'B27 gate RELOCKS after unverify (403)' ($r.status -eq 403 -and (ErrorCode $r.content) -eq 'ACCOUNT_PENDING') "status=$($r.status) code=$(ErrorCode $r.content)"
  Check 'B28 PENDING gate never leaks a stale rejection reason' ($r.content -notmatch [regex]::Escape($reason)) 'ACCOUNT_PENDING branch wins'

  # Admin accounts are never verification targets. The SELF guard inside
  # rejectUser/unverifyUser is defence-in-depth only: requireAdmin() can only
  # ever hand back role=ADMIN, so an HTTP caller always hits TARGET_IS_ADMIN.
  $r = Req 'POST' "/api/admin/users/$adminId/reject" (JsonBody @{ reason = 'attempting to reject an admin account' }) $adminSession
  Check 'B29 admin as target -> 409 TARGET_IS_ADMIN' ($r.status -eq 409 -and (ErrorCode $r.content) -eq 'TARGET_IS_ADMIN') "status=$($r.status) code=$(ErrorCode $r.content)"

  # --- audit trail -------------------------------------------------------
  $db = Get-DbState $investorEmail
  if ($null -eq $db) {
    Check 'B30-B33 audit trail readable' $false 'could not read the database'
  } else {
    $audit = @{}
    foreach ($a in $db.audits) { $audit[$a.action] = $a.count }
    Check 'B30 USER_VERIFIED logged exactly once (idempotent)' ($audit['USER_VERIFIED'] -eq 1) "count=$($audit['USER_VERIFIED'])"
    Check 'B31 USER_REJECTED logged exactly once' ($audit['USER_REJECTED'] -eq 1) "count=$($audit['USER_REJECTED'])"
    Check 'B32 USER_UNVERIFIED logged exactly once' ($audit['USER_UNVERIFIED'] -eq 1) "count=$($audit['USER_UNVERIFIED'])"
    Check 'B33 row is PENDING with verifiedAt cleared' ($null -ne $db.target -and $db.target.status -eq 'PENDING' -and $null -eq $db.target.verifiedAt) "status=$($db.target.status)"
  }
  }
}

# ---------------------------------------------------------------------------
# Layer C - verification-state integrity, read straight from the database.
# These invariants hold for every writer (the admin flow and the set-kyc dev
# utility alike), so a failure here means real data inconsistency.
# ---------------------------------------------------------------------------
Write-Host "`n--- Layer C: verification-state integrity (read-only) ---" -ForegroundColor Cyan

$dbAll = Get-DbState ''
if ($null -eq $dbAll) {
  Check 'C1 database readable' $false 'db probe failed - is another process holding db/gstack.db?'
} else {
  $investors = @($dbAll.users | Where-Object { $_.role -eq 'INVESTOR' })
  Check 'C1 database readable' ($dbAll.users.Count -gt 0) "users=$($dbAll.users.Count) investors=$($investors.Count)"

  $bad = @($investors | Where-Object { $_.status -eq 'VERIFIED' -and $null -eq $_.verifiedAt })
  Check 'C2 every VERIFIED investor has verifiedAt' ($bad.Count -eq 0) "offenders=$(@($bad | ForEach-Object { $_.email }) -join '; ')"

  $bad = @($investors | Where-Object { $_.status -eq 'VERIFIED' -and ($null -ne $_.rejectedAt -or $null -ne $_.rejectionReason) })
  Check 'C3 VERIFIED investors carry no rejection leftovers' ($bad.Count -eq 0) "offenders=$(@($bad | ForEach-Object { $_.email }) -join '; ')"

  # Scoped to admin-flow rejections: the dev utility may set REJECTED directly
  # without a reason, but a row carrying an admin stamp must be complete.
  $bad = @($investors | Where-Object { $_.status -eq 'REJECTED' -and $null -ne $_.rejectedBy -and ($null -eq $_.rejectedAt -or $null -eq $_.rejectionReason) })
  Check 'C4 admin rejections store rejectedAt + reason' ($bad.Count -eq 0) "offenders=$(@($bad | ForEach-Object { $_.email }) -join '; ')"

  $bad = @($investors | Where-Object { $_.status -eq 'PENDING' -and $null -ne $_.verifiedAt })
  Check 'C5 PENDING investors carry no verifiedAt' ($bad.Count -eq 0) "offenders=$(@($bad | ForEach-Object { $_.email }) -join '; ')"
}

Remove-Item -LiteralPath $script:DbProbePath -ErrorAction SilentlyContinue

Write-Host ("`n=== RESULT: {0} passed, {1} failed, {2} skipped ===" -f $pass, $fail, $skip) -ForegroundColor Cyan
if ($script:mode -ne 'DEV_FALLBACK') {
  Write-Host 'Layer B (verify/reject/unverify lifecycle) was skipped: Clerk owns the session, so it' -ForegroundColor Yellow
  Write-Host 'cannot be driven over HTTP. Point -BaseUrl at a DEV_FALLBACK instance, or run the' -ForegroundColor Yellow
  Write-Host 'browser steps in README -> "Manual verification (Feature #2)".' -ForegroundColor Yellow
}
if ($fail -gt 0) { exit 1 } else { exit 0 }
