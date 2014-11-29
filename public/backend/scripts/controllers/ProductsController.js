app.controller('ProductsController', ['$scope', 'products', 'Product',
    function ($scope, products, Product) {
        $scope.products = products;
        $scope.units = ['Kilo', 'Gramo', 'Unidad'];
        $scope.Product = Product;
        $scope.save = function (product) {
            product.$save(function (u, putResponseHeaders) {
                //u => saved user object
                //putResponseHeaders => $http header getter
                alert(u);
            });
        }

        $scope.saveAll = function () {
            Product.saveAll($scope.products);
            //$scope.products.forEach(function (prod) { prod.$save(); });

            alert('Guardado!')
        }
    }]);