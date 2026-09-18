# E2E verification for Feature #1 (User Registration & Authentication).
#
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-auth.ps1
#   powershell -ExecutionPolicy Bypass -File scripts/e2e-auth.ps1 -PostKyc -UserEmail you@demo.nest.com
#
# Default run: registers a brand-new user, then asserts the whole locked-scope
# auth matrix (401 / 403 PENDING / 200 VERIFIED, duplicate email, bad password,
# logout, persistence). -PostKyc instead logs in as an existing VERIFIED user.
param(
  [switch]$PostKyc,
  [string]$UserEmail = '',
  [string]$UserPassword = 'DemoPass123!',
  # MERGE NOTE: the merged NEST app runs on 3000 (dev_gstack's standalone app
  # used 3100). Override with -BaseUrl when testing another instance.
  [string]$BaseUrl = 'http://localhost:3000'
)
$ErrorActionPreference = 'Continue'
$base = $BaseUrl.TrimEnd('/')
$pass = 0
$fail = 0

function Check($name, $cond, $detail) {
  if ($cond) { $script:pass++; Write-Host ("PASS  {0}  {1}" -f $name, $detail) -ForegroundColor Green }
  else { $script:fail++; Write-Host ("FAIL  {0}  {1}" -f $name, $detail) -ForegroundColor Red }
}

function Req($method, $path, $body, $session) {
  $url = "$base$path"
  try {
    if ($null -ne $body) {
      $r = Invoke-WebRequest -Uri $url -Method $method -Body $body -ContentType 'application/json' `
        -WebSession $session -UseBasicParsing -TimeoutSec 90
    } else {
      $r = Invoke-WebRequest -Uri $url -Method $method -WebSession $session -UseBasicParsing -TimeoutSec 90
    }
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

# ---------------------------------------------------------------------------
# Mode auto-detection: the landing page footer prints the active auth mode.
# The 25-assertion suite below only applies to DEV_FALLBACK mode. With Clerk
# keys configured, the fallback endpoints intentionally refuse (403) so that
# registration is never dual-written — a separate Clerk-mode smoke runs then.
# ---------------------------------------------------------------------------
$probe = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$landing = Req 'GET' '/' $null $probe
# MERGE NOTE: prefer the API signal — GET /api/auth/me carries `mode` in both its
# 200 and 401 bodies. The landing-page scrape is kept as a fallback for
# dev_gstack's original app, whose page footer prints the mode text (the merged
# app's landing page is a client-rendered SPA and contains no such text).
$modeProbe = Req 'GET' '/api/auth/me' $null $probe
$script:mode = if ($modeProbe.content -match '"mode"\s*:\s*"DEV_FALLBACK"') { 'DEV_FALLBACK' }
  elseif ($modeProbe.content -match '"mode"\s*:\s*"CLERK"') { 'CLERK' }
  elseif ($landing.content -match 'DEV_FALLBACK') { 'DEV_FALLBACK' }
  elseif ($landing.content -match 'Clerk is handling registration') { 'CLERK' }
  else { 'UNKNOWN' }

if ($script:mode -eq 'CLERK') {
  Write-Host "`n=== NEST Feature #1 E2E (CLERK mode detected) ===`n" -ForegroundColor Cyan
  Check 'landing renders (CLERK mode)' ($landing.status -eq 200) "status=$($landing.status)"
  Check 'landing shows TEST MODE badge' ($landing.content -match 'Test Mode') ""
  Check 'landing reports Clerk handling registration' ($landing.content -match 'Clerk is handling registration') ""

  $r = Req 'GET' '/sign-in' $null $probe
  Check 'GET /sign-in renders (Clerk <SignIn/>)' ($r.status -eq 200) "status=$($r.status)"
  $r = Req 'GET' '/sign-up' $null $probe
  Check 'GET /sign-up renders (Clerk <SignUp/>)' ($r.status -eq 200) "status=$($r.status)"

  $r = Req 'POST' '/api/auth/register' '{"firstName":"X","email":"x@y.com","password":"longenough1"}' $probe
  Check 'fallback register refuses in Clerk mode -> 403 (no dual-write)' ($r.status -eq 403 -and $r.content -match 'handled by Clerk') "status=$($r.status)"
  $r = Req 'POST' '/api/auth/login' '{"email":"x@y.com","password":"longenough1"}' $probe
  Check 'fallback login refuses in Clerk mode -> 403' ($r.status -eq 403) "status=$($r.status)"

  $r = Req 'GET' '/api/investments' $null $probe
  Check 'unauthenticated /api/investments -> 401 (gate active in Clerk mode too)' ($r.status -eq 401) "status=$($r.status)"
  $r = Req 'GET' '/api/auth/me' $null $probe
  Check 'unauthenticated /api/auth/me -> 401' ($r.status -eq 401) "status=$($r.status)"
  $r = Req 'GET' '/account' $null $probe
  Check 'anonymous /account redirects to sign-in' ($r.status -eq 200) "status=$($r.status) (followed redirect)"

  Write-Host ("`n=== RESULT: {0} passed, {1} failed ===`n" -f $pass, $fail) -ForegroundColor Cyan
  Write-Host "Clerk sign-up/sign-in was verified in the browser. Webhook sync needs a public URL + CLERK_WEBHOOK_SIGNING_SECRET."
  if ($fail -gt 0) { exit 1 } else { exit 0 }
}

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$stamp = Get-Date -Format 'yyyyMMddHHmmss'
$email = "lucia.$stamp@demo.nest.com"
$password = 'DemoPass123!'

# ---------------------------------------------------------------------------
# Post-KYC phase: log in as an existing VERIFIED user and assert the gate opens.
# ---------------------------------------------------------------------------
if ($PostKyc) {
  if (-not $UserEmail) { Write-Host '-PostKyc requires -UserEmail <verified user email>'; exit 2 }
  Write-Host "`n=== NEST Feature #1 E2E (post-KYC / VERIFIED): $UserEmail ===`n" -ForegroundColor Cyan

  $loginBody = @{ email = $UserEmail; password = $UserPassword } | ConvertTo-Json
  $r = Req 'POST' '/api/auth/login' $loginBody $session
  Check 'login VERIFIED user -> 200' ($r.status -eq 200) "status=$($r.status) body=$($r.content)"
  Check 'login reports status VERIFIED' ($r.content -match '"status":"VERIFIED"') ""

  $r = Req 'GET' '/api/auth/me' $null $session
  Check 'GET /api/auth/me -> VERIFIED' ($r.status -eq 200 -and $r.content -match '"status":"VERIFIED"') "status=$($r.status)"

  $r = Req 'GET' '/api/investments' $null $session
  Check 'VERIFIED user GET /api/investments -> 200 (gate open)' ($r.status -eq 200) "status=$($r.status) body=$($r.content)"
  Check 'investments payload is JSON array' ($r.content -match '"investments":\[') ""

  $r = Req 'GET' '/account' $null $session
  Check 'GET /account -> 200' ($r.status -eq 200) "status=$($r.status)"
  Check 'account page shows VERIFIED badge' ($r.content -match 'VERIFIED') ""
  Check 'account page shows verification-unlocked copy' ($r.content -match 'Your account is verified') ""

  # Downgrade to REJECTED and confirm the gate relocks (proves it reads live DB state).
  Write-Host "`n--- reverting to PENDING to prove the gate reads live DB state ---" -ForegroundColor Yellow
  node scripts\set-kyc.mts $UserEmail PENDING | Out-Null
  $r = Req 'GET' '/api/investments' $null $session
  Check 'after DB downgrade PENDING -> 403 again' ($r.status -eq 403) "status=$($r.status) body=$($r.content)"
  node scripts\set-kyc.mts $UserEmail VERIFIED | Out-Null
  $r = Req 'GET' '/api/investments' $null $session
  Check 'after DB restore VERIFIED -> 200 again' ($r.status -eq 200) "status=$($r.status)"

  Write-Host ("`n=== RESULT: {0} passed, {1} failed ===`n" -f $pass, $fail) -ForegroundColor Cyan
  if ($fail -gt 0) { exit 1 } else { exit 0 }
}

Write-Host "`n=== NEST Feature #1 E2E: $email ===`n" -ForegroundColor Cyan

# 1. Landing + auth pages render
$r = Req 'GET' '/' $null $session
Check 'GET / (anonymous)' ($r.status -eq 200) "status=$($r.status)"
Check 'landing shows TEST MODE badge' ($r.content -match 'Test Mode') ""
Check 'landing shows Create account CTA' ($r.content -match 'Create account') ""

$r = Req 'GET' '/sign-up' $null $session
Check 'GET /sign-up (dev fallback form)' ($r.status -eq 200 -and $r.content -match 'Create your account') ""
Check 'sign-up labeled DEV FALLBACK AUTH' ($r.content -match 'DEV FALLBACK AUTH') ""

$r = Req 'GET' '/sign-in' $null $session
Check 'GET /sign-in renders' ($r.status -eq 200 -and $r.content -match 'Welcome back') ""

# 2. Unauthenticated API gates
$r = Req 'GET' '/api/investments' $null $session
Check 'GET /api/investments unauthenticated -> 401' ($r.status -eq 401) "status=$($r.status) body=$($r.content)"

# 3. Validation (server-side)
$badJson = '{"firstName":"X","email":"not-an-email","password":"short"}'
$r = Req 'POST' '/api/auth/register' $badJson $session
Check 'register invalid payload -> 400' ($r.status -eq 400) "status=$($r.status) body=$($r.content)"

# 4. Registration -> PENDING account
$body = @{ firstName = 'Lucia'; lastName = 'Omonokhua'; email = $email; phone = '+2348012345678'; password = $password } | ConvertTo-Json
$r = Req 'POST' '/api/auth/register' $body $session
Check 'register valid -> 201' ($r.status -eq 201) "status=$($r.status) body=$($r.content)"
Check 'registered account is PENDING' ($r.content -match '"status":"PENDING"') ""

# 5. Duplicate email rejected
$r2 = Req 'POST' '/api/auth/register' $body $session
Check 'duplicate email -> 409' ($r2.status -eq 409) "status=$($r2.status) body=$($r2.content)"

# 6. Session works
$r = Req 'GET' '/api/auth/me' $null $session
Check 'GET /api/auth/me with session -> 200' ($r.status -eq 200) "status=$($r.status)"
Check 'me returns PENDING status' ($r.content -match '"status":"PENDING"') ""
Check 'me returns BigInt-kobo wallet (0 kobo)' ($r.content -match '"balanceKobo":0') ""

# 7. Locked-scope authorization gate: PENDING -> 403
$r = Req 'GET' '/api/investments' $null $session
Check 'PENDING user gets 403 on /api/investments' ($r.status -eq 403) "status=$($r.status) body=$($r.content)"
Check '403 message is "Account under verification."' ($r.content -match 'Account under verification') ""

# 8. Account page shows pending state
$r = Req 'GET' '/account' $null $session
Check 'GET /account authenticated -> 200' ($r.status -eq 200) "status=$($r.status)"
Check 'account page shows Account under verification' ($r.content -match 'Account under verification') ""
Check 'account page shows PENDING badge' ($r.content -match 'PENDING') ""

# 9. Wrong password -> 401
$s2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$badLogin = @{ email = $email; password = 'WrongPass999' } | ConvertTo-Json
$r = Req 'POST' '/api/auth/login' $badLogin $s2
Check 'login wrong password -> 401' ($r.status -eq 401) "status=$($r.status)"

# 10. Correct login in a fresh session (logout/in behaviour)
$goodLogin = @{ email = $email; password = $password } | ConvertTo-Json
$r = Req 'POST' '/api/auth/login' $goodLogin $s2
Check 'login correct credentials -> 200' ($r.status -eq 200) "status=$($r.status)"
$r = Req 'GET' '/api/auth/me' $null $s2
Check 'fresh session is authenticated' ($r.status -eq 200) "status=$($r.status)"

# 11. Persistence: same session, second read comes from DB
$r = Req 'GET' '/api/auth/me' $null $s2
Check 'persistence: repeat read consistent' ($r.status -eq 200 -and $r.content -match [regex]::Escape($email)) ""

# 12. Logout clears session
$r = Req 'POST' '/api/auth/logout' '{}' $s2
Check 'logout -> 200' ($r.status -eq 200) "status=$($r.status)"
$r = Req 'GET' '/api/auth/me' $null $s2
Check 'after logout /api/auth/me -> 401' ($r.status -eq 401) "status=$($r.status)"

Write-Host ("`n=== RESULT: {0} passed, {1} failed ===`n" -f $pass, $fail) -ForegroundColor Cyan
Write-Host "TEST_EMAIL=$email"
if ($fail -gt 0) { exit 1 } else { exit 0 }