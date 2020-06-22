const app = angular.module("myApp", []);


const _appCtrl = function($scope, $http){


	$scope.studentsList = [
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj",
		"Shalem Raj"
	];

	// $scope.studentsList = [];

	$scope.uploadStudentsCSV = function () {
		
		var form_data = new FormData();
		angular.forEach($scope.files, function (file) {
		    form_data.append('fileToUpload', file);
		});
		$http.post(
			'api/routes.php?action=students',
			form_data,
			{
			    transformRequest: angular.identity,
			    headers: {
			        'Content-Type': undefined,
			        'Process-Data': false
			    }
			}
		).then(function (httpResponse) {
			var apiResponse = httpResponse.data;
			if(!apiResponse.complete){
				$scope.studentsList = [];
				swal("Failed", apiResponse.message, "error");
				return;
			}

			$scope.studentsList = apiResponse.result;
			swal("Success", apiResponse.message, "success");
		});
	};
};

app.controller(
	"appCtrl",
	[
		"$scope",
		"$http",
		_appCtrl
	]
);

app.directive("fileInput", function ($parse) {
	return {
		link: function ($scope, element, attrs) {
			element.on("change", function (event) {
				var files = event.target.files;
				$parse(attrs.fileInput).assign($scope, element[0].files);
				$scope.$apply();
			});
		}
	}
});