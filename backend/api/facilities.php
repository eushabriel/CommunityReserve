<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$stmt = $pdo->query("SELECT * FROM facilities");
$facilities = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse($facilities);
?>