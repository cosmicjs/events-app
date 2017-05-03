(function () {
    'use strict';
    
    angular
        .module('user', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('user', {
                url: '/user', 
                // abstract: true,
                templateUrl: '../views/main.html',
                data: {
                    is_granted: ['ROLE_USER']
                }
            });
    }
    
})();
 