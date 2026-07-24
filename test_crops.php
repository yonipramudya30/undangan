<?php
$src_path = 'C:/Users/user/.gemini/antigravity-ide/brain/88670f25-17f1-4de1-922d-714d5976450c/media__1784636181900.jpg';
$src = imagecreatefromjpeg($src_path);
$orig_w = imagesx($src);
$orig_h = imagesy($src);

// We want a square-ish or slightly vertical output (e.g. 800x800 or 800x1200 or matching the original bride 867x834).
// Let's create different crop configurations to inspect.
// Note: output dimensions will be 800x800 for circular profile pictures to look best and be consistent!

$crops = [
    'crop1' => [
        'x' => (int)($orig_w * 0.15),
        'y' => (int)($orig_h * 0.35),
        'w' => (int)($orig_w * 0.70),
        'h' => (int)($orig_h * 0.40)
    ],
    'crop2' => [
        'x' => (int)($orig_w * 0.18),
        'y' => (int)($orig_h * 0.36),
        'w' => (int)($orig_w * 0.64),
        'h' => (int)($orig_h * 0.38)
    ],
    'crop3' => [
        'x' => (int)($orig_w * 0.20),
        'y' => (int)($orig_h * 0.37),
        'w' => (int)($orig_w * 0.60),
        'h' => (int)($orig_h * 0.35)
    ],
    'crop4' => [
        // Just resize without crop
        'x' => 0,
        'y' => 0,
        'w' => $orig_w,
        'h' => $orig_h
    ]
];

foreach ($crops as $name => $c) {
    $out_w = 800;
    $out_h = 800; // Let's make it 800x800 square so it matches a circular photo beautifully!
    $dst = imagecreatetruecolor($out_w, $out_h);
    imagecopyresampled($dst, $src, 0, 0, $c['x'], $c['y'], $out_w, $out_h, $c['w'], $c['h']);
    imagejpeg($dst, "images/test_{$name}.jpg", 95);
    imagedestroy($dst);
    echo "Saved images/test_{$name}.jpg\n";
}

imagedestroy($src);
?>
