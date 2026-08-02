Get-ChildItem -Path "$PSScriptRoot" -Filter *.html | ForEach-Object {
    $c = Get-Content $_.FullName -Raw

    # Header block
    $hs = $c.IndexOf('<header')
    $he = $c.IndexOf('</header>')
    $headerBlock = ''
    if ($hs -ge 0 -and $he -ge 0) { $headerBlock = $c.Substring($hs, $he - $hs) }

    $hOpen = ([regex]::Matches($headerBlock, '<div[\s>]')).Count
    $hClose = ([regex]::Matches($headerBlock, '</div>')).Count

    # Main block (from </header> to </main>)
    $ms = $c.IndexOf('</header>')
    $me = $c.IndexOf('</main>')
    $mainBlock = ''
    if ($ms -ge 0 -and $me -ge 0) { $mainBlock = $c.Substring($ms, $me - $ms) }

    $mOpen = ([regex]::Matches($mainBlock, '<div[\s>]')).Count
    $mClose = ([regex]::Matches($mainBlock, '</div>')).Count

    $result = [PSCustomObject]@{
        File         = $_.Name
        HeaderDivOpen = $hOpen
        HeaderDivClose = $hClose
        HeaderDelta   = $hOpen - $hClose
        MainDivOpen   = $mOpen
        MainDivClose  = $mClose
        MainDelta     = $mOpen - $mClose
    }
    $result
} | Format-Table -AutoSize

