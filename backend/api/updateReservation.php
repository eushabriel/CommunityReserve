<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'PATCH' && $method !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$id = $_GET['id'] ?? null;
$data = getJsonInput();
$status = $data['status'] ?? '';

$validStatuses = ['pending', 'approved', 'rejected'];

if (!$id) {
    jsonResponse(['error' => 'Missing reservation id'], 400);
    echo 'Error: Missing reservation id';
}

if (!in_array($status, $validStatuses, true)) {
    jsonResponse(['error' => 'Invalid status'], 400);
    echo 'Error: Invalid status';
}

$stmt = $pdo->prepare("
    UPDATE reservations
    SET status = :status
    WHERE id = :id
");

$stmt->execute([
    ':status' => $status,
    ':id' => $id
]);

jsonResponse(['success' => true]);
?>