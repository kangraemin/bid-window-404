# IE11 확인(windows-2019): 탐색기식 압축풀기 → IE로 index.html 열기 → 캡처·문서 상태
$ErrorActionPreference = 'Continue'
New-Item -ItemType Directory -Force out | Out-Null
$out = (Resolve-Path out).Path; $log = "$out\ie.txt"
function L($s) { $s | Tee-Object -FilePath $log -Append }
L ("OS: " + (Get-CimInstance Win32_OperatingSystem | ForEach-Object { "$($_.Caption) $($_.Version)" }))
$ie = "C:\Program Files\Internet Explorer\iexplore.exe"
L "iexplore exists: $(Test-Path $ie) ver: $((Get-Item $ie -ErrorAction SilentlyContinue).VersionInfo.ProductVersion)"
# 서버 IE 보안 강화 구성(ESC) 끄기 — 일반 PC엔 없는 설정
foreach ($k in 'HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A7-37EF-4b3f-8CFC-4F3A74704073}','HKLM:\SOFTWARE\Microsoft\Active Setup\Installed Components\{A509B1A8-37EF-4b3f-8CFC-4F3A74704073}') { Set-ItemProperty -Path $k -Name IsInstalled -Value 0 -ErrorAction SilentlyContinue }
# 로컬 파일 스크립트 차단 노란 줄(Local Machine Lockdown) 기본값 기록
L "LMZL: $((Get-ItemProperty 'HKCU:\Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_LOCALMACHINE_LOCKDOWN' -ErrorAction SilentlyContinue | Out-String).Trim())"
$z = Get-ChildItem check -Filter *.zip | Select-Object -First 1
$dl = "$env:USERPROFILE\Downloads"; $zp = "$dl\$($z.Name)"; Copy-Item $z.FullName $zp -Force
Set-Content -Path $zp -Stream Zone.Identifier -Value "[ZoneTransfer]`r`nZoneId=3"
New-Item -ItemType Directory -Force "$dl\shell" | Out-Null
$sh = New-Object -ComObject Shell.Application
$sh.NameSpace("$dl\shell").CopyHere($sh.NameSpace($zp).Items(), 0x14); Start-Sleep 8
$idx = "$dl\shell\bid-window-404\index.html"
L "index exists: $(Test-Path $idx)"
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
function Shot($p) { $b = [System.Windows.Forms.SystemInformation]::VirtualScreen; $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height; $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size); $bmp.Save($p); $g.Dispose(); $bmp.Dispose(); L "shot $p" }
Start-Process $ie -ArgumentList "`"$idx`""
Start-Sleep 20; Shot "$out\ie-20s.png"
Start-Sleep 25; Shot "$out\ie-45s.png"
L "창 제목: $((Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { "$($_.ProcessName)='$($_.MainWindowTitle)'" }) -join ' ; ')"
# COM으로 문서 상태 읽기
try {
  $app = New-Object -ComObject Shell.Application
  foreach ($w in $app.Windows()) { try { $d = $w.Document; L "COM: url=$($w.LocationURL) title=$($d.title) ready=$($d.readyState) docMode=$($d.documentMode) canvas=$($d.getElementsByTagName('canvas').length)" } catch { L "COM err $_" } }
} catch { L "COM fail $_" }
