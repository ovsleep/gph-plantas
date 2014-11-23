products = [{ name: 'lechuga', price: 25, image: '/images/lechuga.png' },
            { name: 'anana', price: 25, image: '/images/anana.png' },
            { name: 'frutilla', price: 25, image: '/images/frutilla.png' },
            { name: 'kiwi', price: 25, image: '/images/kiwi.png' },
            { name: 'limon', price: 25, image: '/images/limon.png' }];


function ProductController($scope) {
    $scope.products = products;
}