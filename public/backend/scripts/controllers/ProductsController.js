app.controller('ProductsController', ['$scope', 'products',
    function ($scope, products, cart) {
        $scope.products = products;
        $scope.units = ['Kilo', 'Gramo', 'Unidad'];

        $scope.save = function (product) {
            product.$save(function (u, putResponseHeaders) {
                //u => saved user object
                //putResponseHeaders => $http header getter
                alert(u);
            });
        }

        $scope.saveAll = function () {
            $scope.products.forEach(function (prod) { prod.$save(); });

            alert('Guardado!')
        }
    }]);