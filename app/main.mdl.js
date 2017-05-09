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
            'angular-loading-bar',

            'event',
            'user',
            
            'config'
        ])
        .config(config)
        .run(run);

    var app = angular
        .module('main');

    config.$inject = ['$stateProvider', '$urlRouterProvider', 'cfpLoadingBarProvider', 'BUCKET_SLUG'];
    function config($stateProvider, $urlRouterProvider, cfpLoadingBarProvider, BUCKET_SLUG) {
        cfpLoadingBarProvider.includeSpinner = false;
        

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
            .state('blog', {
                url: '/blog',
                templateUrl: '../blog.html',
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

    run.$inject = ['$rootScope', '$cookieStore', '$http', 'crAcl'];

    function run($rootScope, $cookieStore, $http, crAcl) {
        // function saveConfig(response) {
        //     app.constant('BUCKET_SLUG', response.data.BUCKET_SLUG || 'events');
        //     app.constant('URL', 'https://api.cosmicjs.com/v1/');
        //     app.constant('MEDIA_URL', 'https://api.cosmicjs.com/v1/events/media');
        //     app.constant('READ_KEY', 'NSAzCEjy62aPHj4tpUNrzeBY3IBfFDHPK67A9eqIOGsZqgztnf');
        //     app.constant('WRITE_KEY', 'GXQFFuUibgOtKB29ywtKwwXdpFK29fBZrBnO3YjtfTcV6qkpld');
        //     app.constant('DEFAULT_EVENT_IMAGE', 'https://cosmicjs.com/uploads/ce6ed110-31da-11e7-aef2-87741016d54e-no_image.png');
        // }
        //
        // function error() {
        //     Notification.error('Config variables not found!');
        // }
        //
        // $http.get('/config').then(saveConfig, error);        

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
 