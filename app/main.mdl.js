(function () {
    'use strict';
    
    angular
        .module('main', [
            'ui.router',
            'ui.bootstrap',
            'ngMask',
            'ngCookies',
            'ngRoute',
            'ngDialog',
            'cr.acl',
            'ui-notification',
            'ngFlash',
            'textAngular',
            'flow',
            
            'event',
            'user'
        ])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'flowFactoryProvider', 'WRITE_KEY'];
    function config($stateProvider, $urlRouterProvider, flowFactoryProvider, WRITE_KEY) {

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            var $location = $injector.get("$location");
            var crAcl = $injector.get("crAcl");

            var state = "";

            switch (crAcl.getRole()) {
                case 'ROLE_USER':
                    state = 'main.event.feed';
                    break;
            }

            if (state) $state.go(state);
            else $location.path('/login'); 
        });
 
        $stateProvider
            .state('main', {
                url: '/',
                abstract: true,
                templateUrl: '../views/main.html',
                controller: 'UserCtrl as global',
                data: {
                    is_granted: ['ROLE_USER']
                }
            })
            .state('auth', {
                url: '/login',
                templateUrl: '../views/auth/login.html',
                controller: 'AuthCtrl as auth',
                onEnter: ['AuthService', function(AuthService) {
                    AuthService.clearCredentials();
                }],
                data: {
                    is_granted: ['ROLE_GUEST']
                }
            });
    } 

    run.$inject = ['$rootScope', '$cookieStore', '$http', 'crAcl', 'AuthService'];
    function run($rootScope, $cookieStore, $http, crAcl, AuthService) {

        $rootScope.globals = $cookieStore.get('globals') || {};
        $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

        crAcl
            .setInheritanceRoles({
                'ROLE_SUPER_ADMIN': ['ROLE_SUPER_ADMIN', 'ROLE_GUEST'],
                'ROLE_USER': ['ROLE_USER', 'ROLE_GUEST'],
                'ROLE_GUEST': ['ROLE_GUEST']
            }); 

        crAcl
            .setRedirect('auth'); 

        if ($rootScope.globals.currentUser) {
            
            crAcl.setRole($rootScope.globals.currentUser.metadata.role);
        }
        else {
            crAcl.setRole();
        }

    }
    
})();
 