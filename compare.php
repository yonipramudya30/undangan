<?php
$b = getimagesize('images/bride.jpg');
$bo = getimagesize('images/bride_original.jpg');
$m = getimagesize('C:/Users/user/.gemini/antigravity-ide/brain/88670f25-17f1-4de1-922d-714d5976450c/media__1784636181900.jpg');

echo "bride.jpg: " . ($b ? $b[0] . "x" . $b[1] : "not found") . "\n";
echo "bride_original.jpg: " . ($bo ? $bo[0] . "x" . $bo[1] : "not found") . "\n";
echo "media: " . ($m ? $m[0] . "x" . $m[1] : "not found") . "\n";
?>
