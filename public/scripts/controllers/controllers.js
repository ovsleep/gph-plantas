﻿'use strict';

var app = angular.module('GPHPlantas',
    ['ngRoute', 'GPHPlantas.directives', 'GPHPlantas.services']);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
          controller: 'ProductController',
          resolve: {
              products: ["MultiProductLoader", function (MultiProductLoader) {
                  return MultiProductLoader();
              }]
          },
          templateUrl: '/views/products.html'
      })
      .when('/filtro/:type', {
          controller: 'ProductController',
          resolve: {
              products: ["ProductByTypeLoader", function (ProductByTypeLoader) {
                  return ProductByTypeLoader();
              }]
          },
          templateUrl: '/views/products.html'
      })
      .when('/carrito', {
          controller: 'FullCartController',
          templateUrl: '/views/cart.html'
      })
      .when('/confirmar-pedido', {
            controller: 'CheckOutController',
            templateUrl: '/views/checkOut.html',
            access: {
                requiresLogin: true
            }
      })
       .when('/login', {
            controller: 'LoginController',
            templateUrl: '/views/login.html'
        })
      .when('/registro', {
          controller: 'RegisterController',
          templateUrl: '/views/register.html'
      })
      .when('/gracias',{
          controller: 'ThankyouController',
          templateUrl: '/views/thankyou.html'
      })
      .otherwise({ redirectTo: '/' });
}]);

app.run(function ($rootScope, $location, authenticationSvc) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.access) {
            if (!authenticationSvc.getUserInfo()) {
                    $location.path("/login");
                }
            }
    });
});

app.controller('ProductController', ['$scope', 'products', 'cart',
    function ($scope, products, cart) {
        $scope.products = products;
        $scope.cart = cart;
        $scope.productAddingId = '';
        $scope.selectedUnit = '';

        $scope.addProduct = function (product,selectedUnit, quantity, comment) {
            cart.addItem(product, selectedUnit, quantity, comment);
            $scope.productAddingId = '';
            $scope.selectedUnit = '';
        }

        $scope.startAdding = function (product) {
            $scope.productAddingId = product._id;
            $scope.selectedUnit = product.unit;
        }
}]);

app.controller('RegisterController', ['$scope', '$location', 'authenticationSvc',
    function ($scope, $location, authenticationSvc) {
        $scope.message = '';

        $scope.addUser = function () {
            authenticationSvc.register($scope.user)
           .then(function (result) {
               $scope.userInfo = result;
               $location.path("/");
           }, function (error) {
               $window.alert("Ocurrió un error registrando el usuario: " + error);
               console.log(error);
           });
        }
    }]);

app.controller('MenuController', ['$scope', '$location',
function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };
}]);

app.controller('CartController', ['$scope', 'cart',
function ($scope, cart) {
    $scope.cart = cart;
    
    $scope.itemsCount = function () {
        return cart.getTotalCount();
    }

    $scope.addProduct = function () {
        cart.addItem({ id: 1, name: 'testcont', price: 10, quantity: 1, unit: 'kilo' }, 'my comment');
    }
}]);

app.controller('FullCartController', ['$scope', 'cart', '$location',
function ($scope, cart, $location) {
    $scope.cart = cart;

    $scope.itemsCount = function () {
        return cart.getTotalCount();
    }

    $scope.addProduct = function () {
        cart.addItem({ id: 1, name: 'testcont', price: 10, quantity: 1, unit: 'kilo' }, 'my comment');
    }

    $scope.removeProduct = function (id) {
        cart.removeItem(id);
    }

    $scope.clearCart = function (id) {
        if (confirm("Está seguro que quiere quitar todos los productos del pedido?")) {
            cart.clearItems();
        }
    }

    $scope.checkOut = function () {
        $location.path('/confirmar-pedido')
    }
}]);

app.controller('CheckOutController', ['$scope', 'cart', 'Order', '$location', "authenticationSvc",
function ($scope, cart, Order, $location, auth) {
    $scope.cart = cart;
    $scope.user = auth.getUserInfo();

    $scope.itemsCount = function () {
        return cart.getTotalCount();
    }

    $scope.confirmOrder = function () {
        var newOrder = new Order({ lines: cart.items, user: $scope.user, status: 'Pendiente', totalPrice: cart.getTotalPrice() });
        newOrder.$save(function(order){
          cart.clearItems();
          $location.path('/gracias')
        });
    }

}]);

app.controller('ThankyouController', ['$scope', '$location',
function ($scope, $location) {
  $scope.goBack = function(){
      $location.path('/')
  }
}]);

app.controller("LoginController", ["$scope", "$location", "$window", "authenticationSvc",function ($scope, $location, $window, authenticationSvc) {
    $scope.userInfo = null;
    $scope.login = function () {
        authenticationSvc.login($scope.userName, $scope.password)
            .then(function (result) {
                $scope.userInfo = result;
                $location.path("/");
            }, function (error) {
                $window.alert("Invalid credentials");
                console.log(error);
            });
    };

    $scope.cancel = function () {
        $scope.userName = "";
        $scope.password = "";
    };
}]);

app.controller('WelcomeController', ['$scope', '$location', "authenticationSvc",
function ($scope, $location, auth) {
    $scope.auth = auth;
    $scope.logout = function () {
        auth.logout();
        $location.path('/');
    }

    $scope.$watch('auth.getUserInfo()', function (newVal) {
        $scope.user = newVal;
    });

}]);

