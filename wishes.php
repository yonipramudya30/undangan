<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$WISHES_FILE = __DIR__ . '/data/wishes.json';

function loadWishes($file) {
    if (!file_exists($file)) return [];
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

function saveWishes($file, $wishes) {
    file_put_contents($file, json_encode($wishes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'list') {
    // Return all wishes
    $wishes = loadWishes($WISHES_FILE);
    echo json_encode(['success' => true, 'data' => $wishes, 'count' => count($wishes)]);
    exit;
}

if ($method === 'POST' && $action === 'add') {
    $body = json_decode(file_get_contents('php://input'), true);
    
    if (empty($body['nama']) || empty($body['ucapan'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nama dan ucapan harus diisi.']);
        exit;
    }
    
    $wishes = loadWishes($WISHES_FILE);
    
    $newWish = [
        'id' => time() . '_' . rand(1000, 9999),
        'nama' => htmlspecialchars(trim($body['nama']), ENT_QUOTES, 'UTF-8'),
        'wa' => htmlspecialchars(trim($body['wa'] ?? ''), ENT_QUOTES, 'UTF-8'),
        'kehadiran' => in_array($body['kehadiran'] ?? '', ['hadir', 'tidak_hadir']) ? $body['kehadiran'] : 'hadir',
        'ucapan' => htmlspecialchars(trim($body['ucapan']), ENT_QUOTES, 'UTF-8'),
        'waktu' => date('d M Y, H:i'),
        'created_at' => time()
    ];
    
    // Add to front of array
    array_unshift($wishes, $newWish);
    
    saveWishes($WISHES_FILE, $wishes);
    
    echo json_encode(['success' => true, 'message' => 'Ucapan berhasil disimpan!', 'data' => $newWish]);
    exit;
}

if ($method === 'DELETE' && $action === 'delete') {
    $id = $_GET['id'] ?? '';
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID tidak ditemukan.']);
        exit;
    }
    
    $wishes = loadWishes($WISHES_FILE);
    $filtered = array_filter($wishes, fn($w) => $w['id'] !== $id);
    $filtered = array_values($filtered);
    
    saveWishes($WISHES_FILE, $filtered);
    echo json_encode(['success' => true, 'message' => 'Ucapan dihapus.']);
    exit;
}

if ($method === 'DELETE' && $action === 'clear') {
    saveWishes($WISHES_FILE, []);
    echo json_encode(['success' => true, 'message' => 'Semua ucapan dihapus.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
?>
