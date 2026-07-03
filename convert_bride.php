<?php
$filepath = 'images/bride.jpg';
if (!file_exists($filepath)) {
    die("File not found!\n");
}

$size = getimagesize($filepath);
$width = $size[0];
$height = $size[1];
$mime = $size['mime'];

$encoded = base64_encode(file_get_contents($filepath));

$svg_content = '<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="' . $width . '"
     height="' . $height . '"
     viewBox="0 0 ' . $width . ' ' . $height . '">
    <image
        width="' . $width . '"
        height="' . $height . '"
        href="data:' . $mime . ';base64,' . $encoded . '" />
</svg>
';

$svg_path = 'images/bride.svg';
file_put_contents($svg_path, $svg_content);
echo "Converted bride.jpg to bride.svg!\n";
?>
