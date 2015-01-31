var directives = angular.module('GPHPlantas.directives', []);

directives.directive("passwordVerify", function () {
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

directives.directive('cart', function ($window) {
    return {
        restrict: 'E',
        transclude: false,
        link: function (scope, el, attrs) {
            var window = angular.element($window),
                parent = angular.element(el.parent()),
                currentOffsetTop = el.offset().top,
                originalLeft = el.offset().left,
                origCss = {
                    position: "relative",
                    top: el.css('top'),
                    left: 0,
                    //width: getParentWidth()
                };
            handleSnapping();
            window.bind('scroll', function () {
                handleSnapping();
            });
            window.bind('resize', function () {
                el.css({
                    //width: getParentWidth()
                });
            });

            function returnDigit(val) {
                var re = /\d+/;
                var digit = val.match(re)[0];
                return digit;
            }

            function getParentWidth() {
                return returnDigit(parent.css('width')) - returnDigit(parent.css('padding-left')) - returnDigit(parent.css('padding-right'));
            }

            function handleSnapping() {
                if (window.scrollTop() > currentOffsetTop) {
                    var headerOffsetTop = 5;
                    el.css({
                        position: "fixed",
                        top: headerOffsetTop + "px",
                        left: originalLeft + "px"
                        //width: getParentWidth()
                    });
                } else {
                    el.css(origCss);
                   
                }
            }
        }
    };
});