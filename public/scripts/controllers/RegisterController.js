function RegisterController($scope, $location) {
    $scope.message = '';

    $scope.addUser = function () {

        //TODO: enviar usuario
        $.ajax({
            type: 'POST',
            data: $scope.user,
            url: 'http://localhost:3000/users/adduser',
            dataType: 'JSON'
        }).done(function (response) {

            // Check for successful (blank) response
            if (response.msg === '') {
                alert('Usuario Registrado');
                $location.path('/')
            }
            else {
                $scope.message = response.message;
            }
        });
    }
}