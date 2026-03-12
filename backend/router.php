<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($uri) {
    case '/api/login':
        require __DIR__ . '/api/login.php';
        break;

    case '/api/register':
        require __DIR__ . '/api/register.php';
        break;

    case '/api/facilities':
        require __DIR__ . '/api/facilities.php';
        break;

    case '/api/reservations':
        require __DIR__ . '/api/reservations.php';
        break;

    case '/api/updateReservation':
        require __DIR__ . '/api/updateReservation.php';
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Route not found"]);
}

?>