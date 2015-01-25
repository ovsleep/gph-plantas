var directives = angular.module('GPHPlantasBackend.directives', []);

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

//directives.directive("passwordVerify", function () {
//    return {
//        require: "ngModel",
//        scope: {
//            passwordVerify: '='
//        },
//        link: function (scope, element, attrs, ctrl) {
//            scope.$watch(function () {
//                var combined;

//                if (scope.passwordVerify || ctrl.$viewValue) {
//                    combined = scope.passwordVerify + '_' + ctrl.$viewValue;
//                }
//                return combined;
//            }, function (value) {
//                if (value) {
//                    ctrl.$parsers.unshift(function (viewValue) {
//                        var origin = scope.passwordVerify;
//                        if (origin !== viewValue) {
//                            ctrl.$setValidity("passwordVerify", false);
//                            return undefined;
//                        } else {
//                            ctrl.$setValidity("passwordVerify", true);
//                            return viewValue;
//                        }
//                    });
//                }
//            });
//        }
//    };
//});