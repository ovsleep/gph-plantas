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
    .when('/repetir-pedido', {
        controller: 'OrderController',
        templateUrl: '/views/orders.html',
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
      .when('/gracias', {
          controller: 'ThankyouController',
          templateUrl: '/views/thankyou.html'
      })
      .when('/como-comprar', {
          templateUrl: '/views/Instrucciones.html'
      })
      .when('/contacto', {
          templateUrl: '/views/Contacto.html'
      })
      .otherwise({ redirectTo: '/' });
}]);

app.run(function ($rootScope, $location, authenticationSvc) {
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.access) {
            if (!authenticationSvc.getUserInfo()) {
                authenticationSvc.refUrl = $location.path();
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


    $scope.submit = function (productForm) {
        if (productForm.quantity.$valid) {
            cart.addItem($scope.product, $scope.selectedUnit, $scope.quantity, $scope.comment);
            $modalInstance.close();
        }
        else {
            alert('Valor incorrecto.');
            console.log(productForm.quantity.$error)
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller('RegisterController', ['$scope', '$location', 'authenticationSvc', "$window",
    function ($scope, $location, authenticationSvc, $window) {
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

app.controller('AccountController', ['$scope', '$location', 'authenticationSvc', "$window",
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
        var newOrder = new Order({ lines: cart.items, user: $scope.user, status: 'Pendiente', totalPrice: cart.getTotalPrice(), date: new Date() });
        newOrder.$save(function (order) {
            cart.clearItems();
            $location.path('/gracias')
        });
    }

}]);

app.controller('ThankyouController', ['$scope', '$location',
function ($scope, $location) {
    $scope.goBack = function () {
        $location.path('/')
    }
}]);

app.controller("LoginController", ["$scope", "$location", "$window", "authenticationSvc", function ($scope, $location, $window, authenticationSvc) {
    $scope.userInfo = null;
    $scope.login = function () {
        authenticationSvc.login($scope.userName, $scope.password)
            .then(function (result) {
                $scope.userInfo = result;
                $location.path(authenticationSvc.refUrl);
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

app.controller('OrderController', ['$scope', 'Order', 'cart', 'Product', '$q', '$modal', '$location',
function ($scope, Order, cart, Product, $q, $modal, $location) {
    $scope.orders = Order.previous();

    $scope.repeatOrder = function (id) {
        cart.clearItems();

        Order.get({ id: id }).$promise.then(function (toRepeat) {   //obtengo la orden
            var prodQueue = []
            toRepeat.lines.forEach(function (line) {        //preparo el array con las promises para obtener los productos de la orden
                var prodId = line.product._id;
                prodQueue.push(Product.get({ id: prodId }).$promise)

            });
            $q.all(prodQueue).then(function (allProducts) {   //ejecuto y espero a que terminen las promises
                var tmp = [];
                angular.forEach(allProducts, function (response) {
                    tmp.push(response);
                });
                return tmp;
            }).then(function (allResults) {
                var missingProducts = [];
                var idx = 0;
                allResults.forEach(function (product) { //agrego los productos que esten activos al carrito
                    var line = toRepeat.lines[idx];
                    if (product.active) {
                        cart.addItem(product, line.unit, line.quantity, line.comment);
                    }
                    else {
                        missingProducts.push(product);
                    }
                    idx++;
                });

                if (missingProducts.length > 0) {   //alerto de productos inactivos
                    $scope.openModal(missingProducts);
                }
                else {
                    $location.path('/carrito');
                }
            })
        });
    }

    $scope.openModal = function (products) {
        var modalInstance = $modal.open({
            templateUrl: '/views/productMissingModal.html',
            controller: 'ProductMissingModalInstanceCtrl',
            size: 'sm',
            resolve: {
                products: function () {
                    return products;
                }
            }
        });

        modalInstance.result.then(function () {
            $location.path('/carrito');
        }, function () {
            $location.path('/carrito');
        });
    }
}
]);

app.controller('ProductMissingModalInstanceCtrl', function ($scope, $modalInstance, products) {
    $scope.products = products;

    $scope.ok = function () {
        $modalInstance.close();
    };
});