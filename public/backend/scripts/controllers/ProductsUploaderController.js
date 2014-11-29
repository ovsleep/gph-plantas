app.controller('ProductsUploaderController', function ($scope, FileUploader) {
    $scope.uploader = new FileUploader();
    $scope.uploader.url = '/api/backend/productos/multiload';
});