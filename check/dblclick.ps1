# 더블클릭 흉내: 메일 다운로드 표시(MOTW ZoneId=3) 붙인 ZIP → 탐색기식 압축풀기·Expand-Archive → Start-Process(ShellExecute)로 index.html → 15·45초 데스크톱 캡처
$ErrorActionPreference = 'Continue'
$out = (Resolve-Path out).Path
$log = "$out\dblclick.txt"
function L($s) { $s | Tee-Object -FilePath $log -Append }
L ("OS: " + (Get-CimInstance Win32_OperatingSystem | ForEach-Object { "$($_.Caption) $($_.Version) build $($_.BuildNumber)" }))
$z = Get-ChildItem check -Filter *.zip | Select-Object -First 1
$dl = "$env:USERPROFILE\Downloads"
Copy-Item $z.FullName "$dl\$($z.Name)" -Force
$zp = "$dl\$($z.Name)"
Set-Content -Path $zp -Stream Zone.Identifier -Value "[ZoneTransfer]`r`nZoneId=3`r`nReferrerUrl=https://mail.google.com/`r`nHostUrl=https://mail-attachment.googleusercontent.com/"
L "ZIP MOTW: $((Get-Content $zp -Stream Zone.Identifier) -join ' | ')"
# 1) Expand-Archive
Expand-Archive -Path $zp -DestinationPath "$dl\ea" -Force
# 2) 탐색기 압축풀기(Shell.Application CopyHere)
New-Item -ItemType Directory -Force "$dl\shell" | Out-Null
$sh = New-Object -ComObject Shell.Application
$sh.NameSpace("$dl\shell").CopyHere($sh.NameSpace($zp).Items(), 0x14)
Start-Sleep 8
foreach ($d in 'ea','shell') {
  $idx = "$dl\$d\bid-window-404\index.html"
  L "[$d] exists=$(Test-Path $idx) files=$((Get-ChildItem -Recurse -File "$dl\$d").Count)"
  $m = Get-Content $idx -Stream Zone.Identifier -ErrorAction SilentlyContinue
  L "[$d] index.html MOTW: $(if ($m) { $m -join ' | ' } else { '없음' })"
}
L "기본 연결(.html): $((cmd /c assoc .html) -join ' ') / $((Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice' -ErrorAction SilentlyContinue).ProgId)"
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
function Shot($p) {
  $b = [System.Windows.Forms.SystemInformation]::VirtualScreen
  $bmp = New-Object System.Drawing.Bitmap $b.Width, $b.Height
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.CopyFromScreen($b.Left, $b.Top, 0, 0, $bmp.Size)
  $bmp.Save($p, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
  L "shot $p ($($b.Width)x$($b.Height))"
}
# 실제 사용자 PC는 Edge 첫 실행 환영 화면을 이미 넘긴 상태 → 정책으로 환영 화면만 숨김(게임 동작엔 영향 없음)
New-Item -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Edge' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\SOFTWARE\Policies\Microsoft\Edge' -Name HideFirstRunExperience -Value 1 -Type DWord
L 'Edge HideFirstRunExperience=1'
foreach ($d in 'shell','ea') {
  L "[$d] 시작 UTC $((Get-Date).ToUniversalTime().ToString('HH:mm:ss'))"
  Get-Process msedge, chrome, firefox -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Start-Sleep 2
  $idx = "$dl\$d\bid-window-404\index.html"
  Start-Process -FilePath $idx
  Start-Sleep 15; Shot "$out\dbl-$d-15s.png"
  Start-Sleep 30; Shot "$out\dbl-$d-45s.png"
  $procs = Get-CimInstance Win32_Process -Filter "Name='msedge.exe' or Name='chrome.exe' or Name='firefox.exe' or Name='OpenWith.exe'"
  L "[$d] 프로세스: $(($procs | Select-Object -ExpandProperty Name | Sort-Object -Unique) -join ',')"
  $hit = $procs | Where-Object { $_.CommandLine -and ($_.CommandLine -like '*bid-window-404*index.html*') }
  L "[$d] 명령줄에 index.html 경로: $(if ($hit) { 'YES' } else { 'NO' })"
  $hit | Select-Object -First 2 | ForEach-Object { L ("   " + $_.Name + ': ' + $_.CommandLine.Substring(0, [Math]::Min(300, $_.CommandLine.Length))) }
  $ow = Get-Process OpenWith -ErrorAction SilentlyContinue
  L "[$d] '어떻게 열까요'(OpenWith.exe) 대화상자: $(if ($ow) { 'YES' } else { 'NO' })"
  $wins = Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { "$($_.ProcessName)='$($_.MainWindowTitle)'" }
  L "[$d] 창 제목: $($wins -join ' ; ')"
}
# 웹 주소를 기본 브라우저로(GA src=web 확인용)
Get-Process msedge, chrome, firefox -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Start-Sleep 2
L "[web] 시작 UTC $((Get-Date).ToUniversalTime().ToString('HH:mm:ss'))"
Start-Process 'https://kangraemin.github.io/bid-window-404/'
Start-Sleep 15; Shot "$out\dbl-web-15s.png"
Start-Sleep 30; Shot "$out\dbl-web-45s.png"
$wins = Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { "$($_.ProcessName)='$($_.MainWindowTitle)'" }
L "[web] 창 제목: $($wins -join ' ; ')"
L "끝 UTC $((Get-Date).ToUniversalTime().ToString('HH:mm:ss'))"
