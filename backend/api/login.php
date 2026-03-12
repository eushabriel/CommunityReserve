<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if ($email === '' || $password === '') {
    jsonResponse(['error' => 'Missing email or password'], 400);
}

$stmt = $pdo->prepare("
    SELECT id, email, name, role
    FROM users
    WHERE email = :email AND password = :password
");

$stmt->execute([
    ':email' => $email,
    ':password' => $password
]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse(['error' => 'Invalid credentials'], 401);
}

jsonResponse($user);
?>