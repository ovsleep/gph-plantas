app.controller('ProductsUploaderController', function ($scope, FileUploader, $window) {
    $scope.uploader = new FileUploader();
    $scope.uploader.url = '/api/backend/products/multiload';

    if ($window.sessionStorage["userInfo"]) {
        var authData = JSON.parse($window.sessionStorage["userInfo"]);
        if (authData) {
            $scope.uploader.headers.Authorization = authData.accessToken;
        }
    }
    
});