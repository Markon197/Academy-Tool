# Tiny static file server for Windows machines without Python/Node.
# Usage:  powershell -ExecutionPolicy Bypass -File serve.ps1 [-Port 8791]
param([int]$Port = 8791, [string]$Root = $PSScriptRoot)
$mime = @{ '.html'='text/html'; '.css'='text/css'; '.js'='text/javascript'; '.json'='application/json'; '.png'='image/png'; '.svg'='image/svg+xml' }
$l = New-Object Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  $p = $c.Request.Url.LocalPath.TrimStart('/'); if (-not $p) { $p = 'index.html' }
  $f = [IO.Path]::GetFullPath((Join-Path $Root ($p -replace '/', '\')))
  if ($f.StartsWith($Root) -and (Test-Path $f -PathType Leaf)) {
    $b = [IO.File]::ReadAllBytes($f)
    $ext = [IO.Path]::GetExtension($f).ToLower()
    $c.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
