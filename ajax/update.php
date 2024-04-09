<?php

require_once "../connection.php";


$id = $_POST["id"];
$text = isset($_POST["text"]) && $_POST["text"];
$state = isset($_POST["state"]) ? $_POST["state"] : "todo"; 
$important = isset($_POST["important"]) ? $_POST["important"] : 0; 

$state = in_array($state, ["todo", "progress", "completed"]) ? $state : "todo";


if($text){
    $text = mysqli_real_escape_string($conn, $text);

    $q = "UPDATE `todos` SET `text`=?,`state`=?,`important`=? WHERE id = ?";
    $stmt = $conn->prepare($q);
    $stmt->bind_param("sssi", $text, $state, $important, $id);
}
else{
    $q = "UPDATE `todos` SET `state`=?,`important`=? WHERE id = ?";
    $stmt = $conn->prepare($q);
    $stmt->bind_param("ssi", $state, $important, $id);
}

if ($stmt->execute()) {
    $response = array("status" => "success", "message" => "Item updated successfully $state");
    echo json_encode($response);
} else {
    $error = mysqli_error($conn); // Retrieve specific error message
    $response = array("status" => "error", "message" => "updation failed: $error");
    echo json_encode($response);
}



?>