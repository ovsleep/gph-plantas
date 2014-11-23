'use strict';

var app = angular.module('GPHPlantasBackend',
    ['ngRoute', 'GPHPlantasBackend.directives', 'GPHPlantasBackend.services', 'ui.bootstrap', 'angularFileUpload']);

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/', {
          controller: 'DashboardController',
          templateUrl: '/backend/views/Dashboard.html',
          access: {
              requiresLogin: true
          }
      })
    .when('/pedidos', {
        controller: 'OrdersController',
        templateUrl: '/backend/views/orders.html',
        resolve: {
            orders: ["MultiOrderLoader", function (MultiOrderLoader) {
                return MultiOrderLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
    .when('/productos', {
        controller: 'ProductsController',
        templateUrl: '/backend/views/products.html',
        resolve: {
            products: ["MultiProductLoader", function (MultiProductLoader) {
                return MultiProductLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
    .when('/productos/cargar', {
        controller: 'ProductsUploaderController',
        templateUrl: '/backend/views/productsUploader.html',
        access: {
            requiresLogin: true
        }
    })
    .when('/pedidos/:status', {
        controller: 'OrdersController',
        templateUrl: '/backend/views/orders.html',
        resolve: {
            orders: ["OrderByStatusLoader", function (OrderByStatusLoader) {
                return OrderByStatusLoader();
            }]
        },
        access: {
            requiresLogin: true
        }
    })
      .when('/login', {
          controller: 'LoginController',
          templateUrl: '/backend/views/login.html',
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


