var gphServices = angular.module('GPHPlantas', ['ngRoute']);

//Mappings
function gphRoutingConfig($routeProvider) {
    $routeProvider.when('/', {
        controller: ProductController,
        templateUrl: '/views/products.html'
    })
    .when('/registro', {
        controller: RegisterController,
        templateUrl: '/views/register.html'
    })
    .otherwise({ redirectTo: '/' });
}

gphServices.config(gphRoutingConfig);

gphServices.directive("passwordVerify", function () {
    return {
        require: "ngModel",
        scope: {
            passwordVerify: '='
        },
        link: function (scope, element, attrs, ctrl) {
            scope.$watch(function () {
                var combined;

                if (scope.passwordVerify || ctrl.$viewValue) {
                    combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                }
                return combined;
            }, function (value) {
                if (value) {
                    ctrl.$parsers.unshift(function (viewValue) {
                        var origin = scope.passwordVerify;
                        if (origin !== viewValue) {
                            ctrl.$setValidity("passwordVerify", false);
                            return undefined;
                        } else {
                            ctrl.$setValidity("passwordVerify", true);
                            return viewValue;
                        }
                    });
                }
            });
        }
    };
});