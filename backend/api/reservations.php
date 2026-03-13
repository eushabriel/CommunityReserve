<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/response.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? null;
    $role = $_GET['role'] ?? '';

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

/**
 * NOTE: "TEMP" indicates it will be uncommented 
 * when frontend finally supports them
 * IMPORTANT: DO NOT DELETE THEM
 */
if ($method === 'POST') {
    $data = getJsonInput();

    $userId = $data['userId'] ?? null;
    $facilityId = $data['facilityId'] ?? null;

    // --- TEMP ---
    // $startTime = $data['startTime'] ?? '';
    // $endTime = $data['endTime'] ?? '';
    // $purpose = trim($data['purpose'] ?? '');

    /**
     * ----------------------------------------------------------
     * TEMP:
     * change to the following conditions after frontend has been fixed:
     * (!$userId || !$facilityId || $startTime === '' || $endTime === '')
     * ----------------------------------------------------------
     */
    if (!$userId || !$facilityId) {
        jsonResponse(['error' => 'Missing required fields'], 400);
    }

    // --- TEMP ---
    // if (strtotime($endTime) <= strtotime($startTime)) {
    //     jsonResponse(['error' => 'End time must be after start time'], 400);
    // }

    $conflictStmt = $pdo->prepare("
        SELECT *
        FROM reservations
        WHERE facility_id = :facility_id
          AND status = 'approved'
          
        LIMIT 1
    ");

    /**
     * ----------------------------------------------------------
     * TEMP:
     * add the following to the query after frontend has been fixed:
     * ----------------------------------------------------------
     *  AND (
            (start_time <= :start1 AND end_time > :start2)
            OR
            (start_time < :end1 AND end_time >= :end2)
            OR
            (:start3 <= start_time AND :end3 >= end_time)
        )
     */

    $conflictStmt->execute([
        ':facility_id' => $facilityId,
    // --- TEMP ---
        // ':start1' => $startTime,
        // ':start2' => $startTime,
        // ':end1' => $endTime,
        // ':end2' => $endTime,
        // ':start3' => $startTime,
        // ':end3' => $endTime
    ]);

    $conflict = $conflictStmt->fetch(PDO::FETCH_ASSOC);

    // --- TEMP ---
    // if ($conflict) {
    //     jsonResponse(['error' => 'Facility is already booked for this time slot.'], 409);
    // }

    $insertStmt = $pdo->prepare("
        INSERT INTO reservations (user_id, facility_id, start_time, end_time, purpose)
        VALUES (:user_id, :facility_id, :start_time, :end_time, :purpose)
    ");

    $insertStmt->execute([
        ':user_id' => $userId,
        ':facility_id' => $facilityId,
    // --- TEMP: PLACEHOLDER VALUES ---
        ':start_time' => date('Y-m-d H:i:s'),
        ':end_time' => date('Y-m-d H:i:s'),
        ':purpose' => ''
    // --- TEMP ---
        // ':start_time' => $startTime,
        // ':end_time' => $endTime,
        // ':purpose' => $purpose
    ]);

    jsonResponse(['id' => (int) $pdo->lastInsertId()], 201);
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