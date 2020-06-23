<?php

	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");
	header("Access-Control-Allow-Methods: POST");
	header("Access-Control-Max-Age: 3600");
	header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

	error_reporting(-1);

	$finalResponse = array(
		"complete"  => false,
		"message"   => "Invalid Request."
	);

	$actionType = (isset($_GET["action"]))? $_GET["action"] : "";

	switch($actionType) {
		case 'students':
			$finalResponse = processStudents();
			break;

		case 'questions':
			$finalResponse = processQuestions();
			break;
	}	

	exit(json_encode($finalResponse));

	function processStudents(){
		$finalResponse = array(
			"complete"  => false,
			"message"   => "No File Received."
		);

		if(empty($_FILES)){
			return $finalResponse;
		}

		$filename = $_FILES["fileToUpload"]["tmp_name"];
		$fileType = $_FILES["fileToUpload"]["type"];

		$csvMimetypes = array(
			"text/csv",
			"text/plain",
			"application/csv",
			"text/comma-separated-values",
			"application/excel",
			"application/vnd.ms-excel",
			"application/vnd.msexcel",
			"text/anytext",
			"application/octet-stream",
			"application/txt"
		);

		if(!in_array($fileType, $csvMimetypes)) {
			$finalResponse["message"] = "File type must be csv format. Uploaded file type => $fileType";
			return $finalResponse;
		}

		if($_FILES["fileToUpload"]["size"] == 0){
			$finalResponse["message"] = "File seems to be empty.";
			return $finalResponse;
		}

		$csvFileObject = fopen($filename, "r");

		$students = array();

		$rowCount = -1;

		while(($rowArray = fgetcsv($csvFileObject, 10000, ",")) !== FALSE){
			$rowCount++;
			if($rowCount==0){
				continue;
			}
			array_push($students, $rowArray[1]);
		}

		if($rowCount<=0){
			$finalResponse["message"] = "Unable to parse the uploaded file. Please check the CSV file and refer to the sample CSV file";
			return $finalResponse;
		}

		$finalResponse = array(
			"complete"  => true,
			"message"   => "File successfully parsed. ".sizeof($students)." students found." ,
			"result"	=> array_unique($students)
		);

		return $finalResponse;
	}

	function processQuestions(){
		$finalResponse = array(
			"complete"  => false,
			"message"   => "No File Received.",
			"files"		=> $_FILES
		);

		if(empty($_FILES)){
			return $finalResponse;
		}

		$filename = $_FILES["fileToUpload"]["tmp_name"];
		$fileType = $_FILES["fileToUpload"]["type"];

		$csvMimetypes = array(
			"text/csv",
			"text/plain",
			"application/csv",
			"text/comma-separated-values",
			"application/excel",
			"application/vnd.ms-excel",
			"application/vnd.msexcel",
			"text/anytext",
			"application/octet-stream",
			"application/txt"
		);

		if(!in_array($fileType, $csvMimetypes)) {
			$finalResponse["message"] = "File type must be csv format. Uploaded file type => $fileType";
			return $finalResponse;
		}

		if($_FILES["fileToUpload"]["size"] == 0){
			$finalResponse["message"] = "File seems to be empty.";
			return $finalResponse;
		}

		$csvFileObject = fopen($filename, "r");

		$questionsDataset = array();

		$rowCount = -1;

		while(($rowArray = fgetcsv($csvFileObject, 10000, ",")) !== FALSE){
			$rowCount++;

			$group = $rowArray[0];
			if(!isset($questionsDataset[$group])){
				$questionsDataset[$group] = array();
			}

			array_push($questionsDataset[$group], $rowArray[1]);
		}

		if($rowCount<=0){
			$finalResponse["message"] = "Unable to parse the uploaded file. Please check the CSV file and refer to the sample CSV file";
			return $finalResponse;
		}

		$questions = array();
		$finalCount = 0;

		foreach ($questionsDataset as $key => $groupQuestions) {
			array_push($questions, $groupQuestions);
			$finalCount += sizeof($groupQuestions);
		}

		$finalResponse = array(
			"complete"  => true,
			"message"   => "File successfully parsed. ".sizeof($questions)." categories & $finalCount questions parsed." ,
			"result"	=> $questions
		);

		return $finalResponse;
	}

	
?>