app.controller('OrdersController', ['$scope', 'orders', 
    function ($scope, orders) {
        $scope.setOrderStatus = function (order, status) {
            order.status = status;
            order.$save();
        }

        $scope.orders = orders;

        $scope.setOrderReady = function (order) {
            setOrderStatus(order, 'Listo');
        }

        $scope.deleteOrder = function (index) {
            var order = $scope.orders.splice(index, 1)[0];
            //$scope.orders.delete(order);
            order.$delete();
            //delete order;
        }
    }]);