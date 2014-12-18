'use strict';

var app = angular.module('GPHPlantas',
    ['ngRoute', 'GPHPlantas.directives', 'GPHPlantas.services', 'ui.bootstrap']);

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
      .when('/listado', {
          controller: 'ProductController',
          resolve: {
              products: ["MultiProductLoader", function (MultiProductLoader) {
                  return MultiProductLoader();
              }]
          },
          templateUrl: '/views/productsList.html'
      })
      .when('/listado/filtro/:type', {
        controller: 'ProductController',
        resolve: {
            products: ["ProductByTypeLoader", function (ProductByTypeLoader) {
                return ProductByTypeLoader();
            }]
        },
        templateUrl: '/views/productsList.html'
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
      .when('/cuenta', {
          controller: 'AccountController',
          templateUrl: '/views/account.html'
      })
      .when('/gracias',{
          controller: 'ThankyouController',
          templateUrl: '/views/thankyou.html'
      })
      .when('/como-comprar',{
          templateUrl: '/views/comoComprar.html'
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

app.controller('ProductController', ['$scope', 'products', 'cart', '$modal',
    function ($scope, products, cart, $modal) {
        $scope.products = products;
        $scope.cart = cart;
        $scope.productAddingId = '';
        $scope.selectedUnit = '';

        $scope.startAdding = function (product) {
            var modalInstance = $modal.open({
                templateUrl: '/views/productModal.html',
                controller: 'ProductModalInstanceCtrl',
                size: 'sm',
                resolve: {
                    product: function () {
                        return product;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };
}]);

app.controller('ProductModalInstanceCtrl', function ($scope, $modalInstance, product, cart) {
    $scope.product = product;
    $scope.selectedUnit = $scope.product.unit;
    $scope.selectedPrice = $scope.product.price;
    $scope.quantity = 1;
    $scope.comment = '';
    $scope.aproxPrice = false;

    $scope.$watch('selectedUnit', function (selectedUnit, oldValue) {
        if (selectedUnit == $scope.product.unit) {
            $scope.selectedPrice = $scope.product.price;
            $scope.aproxPrice = false;
        } else {
            $scope.selectedPrice = $scope.product.price * 1 * $scope.product.unitWeight;
            $scope.aproxPrice = true;
        }
    });


    $scope.ok = function () {
        cart.addItem($scope.product, $scope.selectedUnit, $scope.quantity, $scope.comment);
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('RegisterController', ['$scope', '$location', 'authenticationSvc',"$window",
    function ($scope, $location, authenticationSvc,$window) {
        $scope.message = '';

        $scope.addUser = function () {
            authenticationSvc.register($scope.user)
           .then(function (result) {
               $location.path("/");
           }, function (error) {
               $window.alert("Ocurrió un error registrando el usuario: " + error);
               console.log(error);
           });
        }
    }]);

app.controller('AccountController', ['$scope', '$location', 'authenticationSvc',"$window",
    function ($scope, $location, authenticationSvc, $window) {
        $scope.message = '';
        $scope.user = authenticationSvc.getUserInfo();
        $scope.changingPassword = false;

        $scope.changePassword = function () {
            $scope.changingPassword = true;
        }

        $scope.updateUser = function () {
            authenticationSvc.updateUser($scope.user).then(function () {
                $window.alert("Datos guardados con éxito!");
                $location.path("/");
            }, function (error) {
                $window.alert("Ocurrió un error registrando el usuario: " + error);
                console.log(error);
            });
        }
        //$scope.addUser = function () {
        //    authenticationSvc.register($scope.user)
        //   .then(function (result) {
        //       $scope.userInfo = result;
        //       $location.path("/");
        //   }, function (error) {
        //       $window.alert("Ocurrió un error registrando el usuario: " + error);
        //       console.log(error);
        //   });
        //}
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

app.controller('CarouselDemoCtrl', function ($scope) {
    $scope.myInterval = 4000;
    var slides = $scope.slides = [];
    $scope.addSlide = function (imgUrl) {
        slides.push({
            image: imgUrl,
        });
    };
    $scope.addSlide('/images/slider/Slider1.png');
    $scope.addSlide('/images/slider/Slider2.png');
    $scope.addSlide('/images/slider/Slider3.png');
    $scope.addSlide('/images/slider/Slider6.png');
    $scope.addSlide('/images/slider/Slider5.png');
    $scope.addSlide('/images/slider/Slider7.png');
    $scope.addSlide('/images/slider/Slider6.png');
    
});
