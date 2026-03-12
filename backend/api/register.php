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
$name = trim($data['name'] ?? '');

if (
    strlen($password) < 8 ||
    !preg_match('/[0-9]/', $password) ||
    !preg_match('/[^A-Za-z0-9]/', $password)
) {
    jsonResponse([
        'error' => 'Password must be at least 8 characters and include a number and symbol.'
    ], 400);
}

if ($email === '' || $password === '' || $name === '') {
    jsonResponse(['error' => 'Missing required fields'], 400);
}

// FOR TESTING: sample admin emails
// in production, use separate config file or env vars to manage admin users
$admins = ['polgabriel09@gmail.com', 'admin@admin.its'];
$role = in_array($email, $admins, true) ? 'admin' : 'resident';

try {
    $stmt = $pdo->prepare("
        INSERT INTO users (email, password, name, role)
        VALUES (:email, :password, :name, :role)
    ");

    $stmt->execute([
        ':email' => $email,
        ':password' => password_hash($password, PASSWORD_DEFAULT),
        ':name' => $name,
        ':role' => $role
    ]);

    jsonResponse([
        'id' => (int) $pdo->lastInsertId(),
        'email' => $email,
        'name' => $name,
        'role' => $role
    ], 201);
} catch (PDOException $e) {
    jsonResponse([
        'error' => 'Registration failed',
        'code' => $e->getCode(),
        'details' => $e->getMessage()
    ], 500);
}
?>