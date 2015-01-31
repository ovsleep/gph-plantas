'use strict';

var services = angular.module('GPHPlantas.services', ['ngResource']);

services.factory('Product', ['$resource', function ($resource) {
    return $resource('/api/productos/listado/:id', { id: '@id' });
}]);

services.factory('ProductByType', ['$resource', function ($resource) {
    return $resource('/api/productos/listado/filtro/:type', { type: '@type' });
}]);

services.factory('MultiProductLoader', ['Product', '$q', function (Product, $q) {
    return function () {
        var delay = $q.defer();
        Product.query(function (products) {
            delay.resolve(products);
        }, function () {
            delay.reject('Problemas obteniendo los productos');
        });

        return delay.promise;
    }
}]);

services.factory('ProductLoader', ['Product', '$route', '$q', function (Product, $route, $q) {
    return function () {
        var delay = $q.defer();
        Product.get({ id: $route.current.params.productId }, function (product) { delay.resolve(product) }, function () {
            delay.reject('Poblemas obteniendo el producto ' + $route.current.params.productId);
        });
        return delay.promise;
    }
}]);

services.factory('ProductByTypeLoader', ['ProductByType', '$route', '$q', function (ProductByType, $route, $q) {
    return function () {
        var delay = $q.defer();
        ProductByType.query({ type: $route.current.params.type }, function (product) { delay.resolve(product) }, function () {
            delay.reject('Poblemas obteniendo los productos de tipo ' + $route.current.params.type);
        });
        return delay.promise;
    }
}]);

services.factory('cart', function () {
    return new shoppingCart('test');
});

services.factory('Order', ['$resource', 'authenticationSvc', function ($resource, authenticationSvc) {
    return $resource('/api/orders/:id', { id: '@id' }, {
        previous: { method: 'GET', url: '/api/orders/previous/' + authenticationSvc.getUserInfo().id, isArray: true }
    });
}]);

services.factory('PreviousOrders', ['$resource', '$q', function ($resource, $q) {
    var prevOrder = $resource('/api/orders/previous/:id', { id: '@id' });
    return function () {
        var delay = $q.defer();
        prevOrder.query(function (orders) {
            delay.resolve(orders);
        }, function () {
            delay.reject('Problemas obteniendo los productos');
        });

        return delay.promise;
    }
}])

services.factory("authenticationSvc", ["$http","$q","$window",function ($http, $q, $window) {
    var userInfo;
    var refUrl;

    function login(userName, password) {
        var deferred = $q.defer();

        $http.post("/api/auth/login", { usr: userName, pass: password })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accessToken,
                    usr:{
                        name: result.data.usr,
                        email: result.data.email,
                        phone: result.data.phone,
                        address: result.data.address,
                        id: result.data.id
                    }
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function register(user) {
        var deferred = $q.defer();

        $http.post("/api/auth/register", { usr: user })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accessToken,
                    usr: {
                        name: result.data.usr,
                        email: result.data.email,
                        phone: result.data.phone,
                        address: result.data.address,
                        id: result.data.id
                    }
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function logout() {
        var deferred = $q.defer();

        $http({
            method: "POST",
            url: "/api/auth/logout",
            headers: {
                "access_token": userInfo.accessToken
            }
        }).then(function (result) {
            userInfo = null;
            $window.sessionStorage["userInfo"] = null;
            deferred.resolve(result);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function updateUser(user) {
        var deferred = $q.defer();

        $http.post("/api/auth/update", { usr: user })
            .then(function (result) {
                userInfo = {
                    accessToken: result.data.accessToken,
                    usr: {
                        name: result.data.usr,
                        email: result.data.email,
                        phone: result.data.phone,
                        address: result.data.address,
                        id: result.data.id
                    }
                };
                $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
                deferred.resolve(userInfo);
            }, function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    }

    function getUserInfo() {
        return userInfo ? userInfo.usr : undefined;
    }

    function init() {
        if ($window.sessionStorage["userInfo"]) {
            userInfo = JSON.parse($window.sessionStorage["userInfo"]);
        }
    }
    init();

    return {
        register: register,
        login: login,
        logout: logout,
        updateUser: updateUser,
        getUserInfo: getUserInfo,
        refUrl: refUrl
    };
}]);

services.factory('authInterceptorService', ['$q', '$location', '$window', function ($q, $location, $window) {

    function request(config) {

        config.headers = config.headers || {};

        var authData = $window.sessionStorage["userInfo"];
        if (authData) {
            config.headers.Authorization = authData.accessToken;
        }

        return config;
    }

    function responseError(rejection) {
        if (rejection.status === 401) {
            $location.path('/login');
        }
        return $q.reject(rejection);
    }

    return {
        request: request,
        responseError: responseError
    }
}]);