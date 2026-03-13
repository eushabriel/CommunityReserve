<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = (int) ($_GET['id'] ?? 0);
    $userId = $_GET['userId'] ?? null;
    $role = $_GET['role'] ?? '';

    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT
                r.*,
                f.name AS facility_name
            FROM reservations r
            JOIN facilities f ON r.facility_id = f.id
            WHERE r.id = :id
            LIMIT 1
        ");

        $stmt->execute([':id' => $id]);
        $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            jsonResponse(['error' => 'Reservation not found'], 404);
            exit;
        }

        jsonResponse($reservation);
    }

    if ($role === 'admin') {
        $stmt = $pdo->query("
            SELECT
                r.*,
                u.name AS user_name,
                f.name AS facility_name
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            JOIN facilities f ON r.facility_id = f.id
            ORDER BY r.created_at DESC
        ");

        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        jsonResponse($reservations);
    }

    if (!$userId) {
        jsonResponse(['error' => 'Missing userId'], 400);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT
            r.*,
            f.name AS facility_name
        FROM reservations r
        JOIN facilities f ON r.facility_id = f.id
        WHERE r.user_id = :user_id
        ORDER BY r.created_at DESC
    ");

    $stmt->execute([':user_id' => $userId]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse($reservations);
}

if ($method === 'POST') {
    $data = getJsonInput();

    $userId = $data['userId'] ?? null;
    $facilityId = $data['facilityId'] ?? null;

    $date = $data['date'] ?? '';
    $startTimeOnly = trim($data['start_time'] ?? '');
    $endTimeOnly = trim($data['end_time'] ?? '');
    $purpose = trim($data['purpose'] ?? '');

    if (!$userId || !$facilityId || $date === '' || $startTimeOnly === '' || $endTimeOnly === '') {
        jsonResponse(['error' => 'Missing required fields'], 400);
        exit;
    }

    $start_time = $date . ' ' . $startTimeOnly . ':00';
    $end_time = $date . ' ' . $endTimeOnly . ':00';

    if (strtotime($end_time) <= strtotime($start_time)) {
        jsonResponse(['error' => 'End time must be after start time'], 400);
        exit;
    }

    $conflictStmt = $pdo->prepare("
        SELECT *
        FROM reservations
        WHERE facility_id = :facility_id
            AND status IN ('pending', 'approved')
            AND (
                start_time < :end_time 
                AND 
                end_time > :start_time
            )
        LIMIT 1
    ");

    $conflictStmt->execute([
        ':facility_id' => $facilityId,
        ':start_time' => $start_time,
        ':end_time' => $end_time
    ]);

    $conflict = $conflictStmt->fetch(PDO::FETCH_ASSOC);

    if ($conflict) {
        jsonResponse(['error' => 'Facility is already booked for this time slot.'], 409);
        exit;
    }

    $insertStmt = $pdo->prepare("
        INSERT INTO reservations (user_id, facility_id, start_time, end_time, purpose)
        VALUES (:user_id, :facility_id, :start_time, :end_time, :purpose)
    ");

    $insertStmt->execute([
        ':user_id' => $userId,
        ':facility_id' => $facilityId,
        ':start_time' => $start_time,
        ':end_time' => $end_time,
        ':purpose' => $purpose
    ]);

    jsonResponse(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($method === 'PATCH') {
    $id = (int) ($_GET['id'] ?? 0);

    if ($id <= 0) {
        jsonResponse(['error' => 'Missing reservation id'], 400);
        exit;
    }

    $data = getJsonInput();

    $facilityId = $data['facility_id'] ?? null;
    $date = trim($data['date'] ?? '');
    $startTimeOnly = trim($data['start_time'] ?? '');
    $endTimeOnly = trim($data['end_time'] ?? '');
    $purpose = trim($data['purpose'] ?? '');

    if (!$facilityId || $date === '' || $startTimeOnly === '' || $endTimeOnly === '') {
        $missing = [];
        if (!$facilityId) $missing[] = 'facility_id';
        if ($date === '') $missing[] = 'date';
        if ($startTimeOnly === '') $missing[] = 'start_time';
        if ($endTimeOnly === '') $missing[] = 'end_time';
        
        jsonResponse(['error' => 'Missing required fields: ' . implode(', ', $missing)], 400);
        exit;
    }

    $start_time = $date . ' ' . $startTimeOnly . ':00';
    $end_time = $date . ' ' . $endTimeOnly . ':00';

    if (strtotime($end_time) <= strtotime($start_time)) {
        jsonResponse(['error' => 'End time must be after start time'], 400);
        exit;
    }

    $conflictStmt = $pdo->prepare("
        SELECT *
        FROM reservations
        WHERE facility_id = :facility_id
          AND id != :id
          AND status IN ('pending', 'approved')
          AND (
              start_time < :end_time
              AND 
              end_time > :start_time
          )
        LIMIT 1
    ");

    $conflictStmt->execute([
        ':facility_id' => $facilityId,
        ':id' => $id,
        ':start_time' => $start_time,
        ':end_time' => $end_time
    ]);

    $conflict = $conflictStmt->fetch(PDO::FETCH_ASSOC);

    if ($conflict) {
        jsonResponse(['error' => 'Facility is already booked for this time slot.'], 409);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE reservations
        SET facility_id = :facility_id,
            start_time = :start_time,
            end_time = :end_time,
            purpose = :purpose
        WHERE id = :id
    ");

    $stmt->execute([
        ':facility_id' => $facilityId,
        ':start_time' => $start_time,
        ':end_time' => $end_time,
        ':purpose' => $purpose,
        ':id' => $id
    ]);

    jsonResponse(['message' => 'Reservation updated successfully']);
}

if ($method === 'DELETE') {
    // remove from database based on id
    $id = (int) ($_GET['id'] ?? 0);
    
    $stmt = $pdo->prepare("
        DELETE FROM reservations 
        WHERE id = :id
    ");
    $stmt->execute([':id' => $id]);
    
    jsonResponse(['message' => 'Reservation deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>