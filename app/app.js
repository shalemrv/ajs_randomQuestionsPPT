const app = angular.module("myApp", []);


const _appCtrl = function($scope, $http, $timeout, $filter){
	
	$scope.imagesList		= [];
	$scope.studentsList		= [];
	$scope.questionsList	= [];

	$scope.pptList 			= [];

	$scope.qGroup	= -1;
	$scope.qIndex	= -1;
	$scope.qTitle	= "";
	$scope.qPath 	= "";


	$scope.downloading		= false;
	$scope.downloadProgress	= 0;
	$scope.downloadingStudent = "";

	$scope.dateTimeNow = "";

	$scope.studentsListFiles	= [];
	$scope.questionsListFiles	= [];

	$scope.studentsList		= ["Jean King","Peter Ferguson","Janine Labrune","Jonas Bergulfsen","Susan Nelson","Zbyszek Piestrzeniewicz","Roland Keitel","Julie Murphy","Kwai Lee","Diego Freyre","Christina Berglund","Jytte Petersen","Mary Saveley","Eric Natividad","Jeff Young","Kelvin Leong","Juri Hashimoto","Wendy Victorino","Veysel Oeztan","Keith Franco","Isabel de","Martine Rance","Marie Bertrand","Jerry Tseng"];
	$scope.imagesList		= ["uploads/test/20200712085444_0.jpg","uploads/test/20200712085444_1.gif","uploads/test/20200712085444_2.jpg","uploads/test/20200712085444_3.jpg","uploads/test/20200712085444_4.jpg","uploads/test/20200712085444_5.jpg"];

	$scope.resetPage = function(){
		$scope.studentsList		= [];
		$scope.questionsList	= [];
		$scope.imagesList		= [];
		$scope.pptList 			= [];
		$scope.downloading 		= false;
		$scope.downloadProgress	= 0;
		$scope.downloadingStudent = "";

		$scope.studentsListFiles	= [];
		$scope.questionsListFiles	= [];

		$scope.resetImageAssign();
	};

	$scope.resetImageAssign = function (){
		$scope.qGroup	= -1;
		$scope.qIndex	= -1;
		$scope.qTitle	= "";
		$scope.qPath 	= "";
	};

	$scope.clearJunk =  function(){
		$http.get("api/routes.php?action=clear").then(
			function(apiResponse){
				console.log("Old filed cleared");
			}
		);
	};

	$scope.clearJunk();

	$scope.uploadImage = function (){
		if(!qImageFiles){
			return;
		}

		var form_data = new FormData();

		angular.forEach(qImageFiles, function (file, ind) {
		    form_data.append('fileToUpload', file);
		});

		$http.post(
			"api/routes.php?action=image",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function(httpResponse){
				var apiResponse = httpResponse.data;
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal({
						icon : "error",
						title: "Failed!",
						text: apiResponse.message,
						timer: 1500,
						showConfirmButton: false
					});
					return;
				}

				qImageFiles= [];

				$scope.imagesList.push(apiResponse.result);

				swal({
					icon : "success",
					title: "Success",
					text: apiResponse.message,
					timer: 1000,
					showConfirmButton: false
				});
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.uploadMultipleImage = function (){
		if(!qImageFiles){
			return;
		}

		var form_data = new FormData();
		var totalFiles = 0;

		angular.forEach(qImageFiles, function (file, ind) {
		    form_data.append(`fileToUpload${ind}`, file);
		    totalFiles++;
		});
		
		form_data.append(`totalFiles`, totalFiles);

		$http.post(
			"api/routes.php?action=image",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function(httpResponse){
				var apiResponse = httpResponse.data;
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal({
						icon : "error",
						title: "Failed!",
						text: apiResponse.message,
						timer: 1500,
						showConfirmButton: false
					});
					return;
				}

				qImageFiles= [];

				apiResponse.result.forEach(function(image){
					$scope.imagesList.push(image);
				});


				swal({
					icon : "success",
					title: "Success",
					text: apiResponse.message,
					timer: 1000,
					showConfirmButton: false
				});
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.uploadStudentsCSV = function (){

		if(!studentsCSVFiles){
			return;
		}

		var form_data = new FormData();
		angular.forEach(studentsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			"api/routes.php?action=students",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function(httpResponse){
				var apiResponse = httpResponse.data;
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal("Failed", apiResponse.message, "error");
					return;
				}

				$scope.studentsList = apiResponse.result;
				swal("", apiResponse.message, "success");
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.uploadQuestionsCSV = function () {

		if(!questionsCSVFiles){
			return;
		}
		
		var form_data = new FormData();
		angular.forEach(questionsCSVFiles, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			"api/routes.php?action=questions",
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(
			function (httpResponse) {
				var apiResponse = httpResponse.data;
				if(!apiResponse.complete){
					$scope.studentsList = [];
					swal("Failed", apiResponse.message, "error");
					return;
				}

				$scope.questionsList = apiResponse.result;

				swal("", apiResponse.message, "success");
			},
			function (httpResponse) {
				$scope.studentsList = [];
				swal("Failed", `HTTP Code - ${httpResponse.status} : Error occured on server`, "error");
			}
		);
	};

	$scope.assignQuestions = function(){
		$scope.pptList = [];
		
		$scope.studentsList.forEach(function(student){

			var pptObject = {
				name 		: student,
				questions	: []
			};			

			$scope.questionsList.forEach(function(category){
				var noQuestions = category.length;

				if(noQuestions){
					var randomQuestion = category[Math.floor(Math.random() * noQuestions)];
					pptObject.questions.push(randomQuestion);
				}
			});

			$scope.pptList.push(pptObject);
		});

		if($scope.pptList.length){
			swal("", `Successfully assigned questions for ${$scope.pptList.length} students. Scroll Down to check and generate PPTs`, "success");
		}
	};

	$scope.initAssignImage = function(qGroup, qIndex, qTitle, qPath){
		$scope.qGroup	= qGroup;
		$scope.qIndex	= qIndex;
		$scope.qTitle	= qTitle;
		$scope.qPath 	= qPath;
	};

	$scope.assignImage = function(path){
		$scope.qPath = path;
		$scope.questionsList[$scope.qGroup][$scope.qIndex].image = path;
		$scope.resetImageAssign();
	};

	$scope.createDownloadIndPPTs = function(){

		$("#downloadModal").modal({
			backdrop: 'static',
			keyboard: false
		});

		$scope.dateTimeNow = $filter("date")(new Date(), 'yyyyMMdd_HHmmss');

		swal("", "If your broswer prompts to grant permission to download multiple files. Please click on ALLOW.", "info").then(
			function(){
				$scope.downloading = true;
				$scope.downloadProgress = 0;
				$scope.downloadCount = 0;
				$scope.totalDownloads = $scope.studentsList.length * $scope.questionsList.length;

				// $("#downloadModal").modal("show");
				
				var seconds = 1;
				$scope.pptList.forEach(function(ppt){
					$timeout(function(){
						$scope.generateIndPPT(ppt);	
					}, seconds*1000)
					seconds += 6;
				});
			}
		);
	};

	$scope.generateIndPPT = function(ppt){

		$scope.downloadingStudent = ppt.name;
		ppt.questions.forEach(function(question, index){
			let pptx = new PptxGenJS();
			let opts = {
				x: 0.0,
				y: 0.25,
				w: '100%',
				h: 1.5,
				align: 'center',
				fontSize: 24,
				color: '0088CC',
				fill: 'F1F1F1'
			};
			pptx.addSlide().addText(
				question,
				opts
			);

			pptx.writeFile(`${ppt.name} Q${index + 1} ${$scope.dateTimeNow}`);
			$scope.downloadCount++;

			$scope.downloadProgress = $scope.downloadCount * 100 / $scope.totalDownloads;
		});		

		if($scope.downloadCount==($scope.pptList.length*$scope.questionsList.length)){
			$("#downloadModal").modal("hide");
			swal("", `Downloaded ${$scope.downloadCount} PPTs. Check your Downloads Folder`);
		}
	}

	$scope.createDownloadPPTs = function(){		

		$scope.dateTimeNow = $filter("date")(new Date(), 'yyyyMMdd_HHmmss');

		swal("", "If your broswer prompts to grant permission to download multiple files. Please click on ALLOW.", "info").then(
			function(){
				$scope.downloading = true;
				$scope.downloadProgress = 0;
				$scope.downloadCount = 0;
				$scope.totalDownloads = $scope.studentsList.length;

				$("#downloadModal").modal({
					backdrop: 'static',
					keyboard: false
				});

				var seconds = 0;
				$scope.pptList.forEach(function(ppt){
					$timeout(function(){
						$scope.generatePPT(ppt);	
					}, seconds*1000)
					seconds += 2;
				});
			}
		);
	};

	$scope.generatePPT = function(ppt){
		
		let pptx	= new PptxGenJS();

		$scope.downloadingStudent = ppt.name;
		ppt.questions.forEach(function(question, index){
			let slide	= pptx.addSlide();
			let opts = {
				x			: 0.0,
				y			: 0.25,
				w			: '100%',
				h			: 1.5,
				align		: 'center',
				fontSize	: 24,
				color		: '000000',
				fill		: 'F1F1F1'
			};

			slide.addText(
				question.title,
				opts
			);

			if(question.image.length){
				slide.addImage({
					path	: question.image,
					x		: 0.25,
					y		: 2,
					w		: 3.3,
					h		: 3.3,
					sizing	: {
						type	: 'contain',
						w		: 3.3,
						h		: 3.3
					}
				});			
			}
		});

		pptx.writeFile(`${ppt.name}-${$scope.dateTimeNow}`);
		$scope.downloadCount++;

		$scope.downloadProgress = $scope.downloadCount * 100 / $scope.totalDownloads;

		if($scope.downloadCount==($scope.pptList.length)){
			$("#downloadModal").modal("hide");
			swal("", `Downloaded ${$scope.downloadCount} PPTs. Check your Downloads Folder`);
		}
	}
};

app.controller(
	"appCtrl",
	[
		"$scope",
		"$http",
		"$timeout",
		"$filter",
		_appCtrl
	]
);

var studentsCSVFiles, questionsCSVFiles, qImageFiles;

app.directive("fileInput", function ($parse) {
	return {
		link: function ($scope, element, attrs) {
			element.on("change", function (event) {
				var files = event.target.files;				
				$parse(attrs.fileInput).assign($scope, files);

				files[attrs.fileInput] = files;

				switch(attrs.fileInput){
					case "qImages"		: qImageFiles		= files; break;
					case "studentsCSV"	: studentsCSVFiles 	= files; break;
					case "questionsCSV"	: questionsCSVFiles	= files; break;
				}

				$scope.$apply();
			});
		}
	}
});
