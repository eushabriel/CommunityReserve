<?php 
declare(strict_types=1);

$dbPath = __DIR__ . '/../../database/community_reserve.db';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('PRAGMA foreign_keys = ON;');

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'resident'
        );

        CREATE TABLE IF NOT EXISTS facilities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            capacity INTEGER,
            image_url TEXT
        );

        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            facility_id INTEGER NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            purpose TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (facility_id) REFERENCES facilities(id)
        );
    ");

    $countStatement = $pdo->query("SELECT COUNT(*) FROM facilities");
    $facilitiesCount = $countStatement->fetchColumn();

    if ($facilitiesCount === 0) {
        $insert = $pdo->prepare("
            INSERT INTO facilities (name, description, capacity, image_url)
            VALUES (?, ?, ?, ?)
        ");

        $insert->execute([
            "Main Hall",
            "Spacious hall for large events and gatherings.",
            200,
            "https://picsum.photos/seed/hall/800/600"
        ]);

        $insert->execute([
            "Basketball Court",
            "Standard size court for sports activities.",
            50,
            "https://picsum.photos/seed/court/800/600"
        ]);

        $insert->execute([
            "Conference Room",
            "Quiet room for meetings and small workshops.",
            20,
            "https://picsum.photos/seed/meeting/800/600"
        ]);

        $insert->execute([
            "Community Garden",
            "Outdoor space for community gardening events.",
            100,
            "https://picsum.photos/seed/garden/800/600"
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit;
}
?>