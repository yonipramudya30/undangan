<?php
// Restore bride image from backup for final crop
$src_path = 'images/bride_original.jpg';
if (!file_exists($src_path)) {
    die("Backup not found!\n");
}

$src = imagecreatefromjpeg($src_path);
$orig_w = imagesx($src);
$orig_h = imagesy($src);

echo "Original: {$orig_w}x{$orig_h}\n";

// Original: 682x1024
// Face center approx at: x=341, y=510 (50% x, 50% y)
// We want a tight crop around face+torso
// Crop from y=400 (39%) to y=820 (80%), center width
$crop_x = (int)($orig_w * 0.12);   
$crop_y = (int)($orig_h * 0.39);   // start at face top
$crop_w = (int)($orig_w * 0.76);   
$crop_h = (int)($orig_h * 0.42);   // 42% height = face + torso

// Scale to 800x1200 like groom
$out_w = 800;
$out_h = 1200;

$dst = imagecreatetruecolor($out_w, $out_h);
imagecopyresampled($dst, $src, 0, 0, $crop_x, $crop_y, $out_w, $out_h, $crop_w, $crop_h);

imagejpeg($dst, 'images/bride.jpg', 93);
imagedestroy($src);
imagedestroy($dst);

echo "Final crop saved: images/bride.jpg ({$out_w}x{$out_h})\n";
?>
