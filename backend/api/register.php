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
        ':password' => $password,
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
    if ($e->getCode() === '23000') { // unique constraint violation
        jsonResponse(['error' => 'Email already exists'], 400);
    }

    jsonResponse(['error' => 'Registration failed'], 500);
}
?>