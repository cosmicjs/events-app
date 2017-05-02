(function () {
    'use strict';
    
    angular
        .module('main', [
            'ui.router',
            'ui.bootstrap',
            'ngMask',
            'ngCookies',
            // 'ngAnimate', 
            'ngDialog',
            'cr.acl',
            'ui-notification',
            'ngFlash'
        ])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];
    function config($stateProvider, $urlRouterProvider, $httpProvider) {

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            var $location = $injector.get("$location");
            var crAcl = $injector.get("crAcl");

            var state = "";

            switch (crAcl.getRole()) {
                case 'ROLE_USER':
                    state = 'main.events';
                    break;
            }

            if (state) $state.go(state);
            else $location.path('/login');
        });
 
        $stateProvider
            .state('main', {
                url: '/',
                // abstract: true,
                templateUrl: '../views/main.html',
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

        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

        crAcl
            .setInheritanceRoles({
                'ROLE_SUPER_ADMIN': ['ROLE_SUPER_ADMIN', 'ROLE_GUEST'],
                'ROLE_USER': ['ROLE_USER', 'ROLE_GUEST'],
                'ROLE_GUEST': ['ROLE_GUEST']
            }); 

        crAcl
            .setRedirect('auth'); 

        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = $rootScope.globals.currentUser.token;
            crAcl.setRole($rootScope.globals.currentUser.role);
        }
        else {
            crAcl.setRole();
        }

    }
    
})();
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl(crAcl, $state, AuthService, Flash, $log) {
        var vm = this;

        vm.login = login;
        vm.register = register;

        function login(credentials) {
            userLogin(credentials);
        } 

        function userLogin(credentials) {
            function success(response) {
                // AuthService.setCredentials(
                //     response.data.data
                // );
                //
                // crAcl.setRole();
                //
                // switch (crAcl.getRole()) {
                //     case 'ROLE_USER':
                //         $state.go('main');
                //         break;
                // }

                $log.info(response); 
            }

            function failed(response) {
                Flash.create('danger', response.data);
                $log.error(response);
            }

            AuthService
                .login(credentials)
                .then(success, failed);
        }

        function register(credentials) {
            function success(response) {
                $log.info(response);

                login(credentials);
            }

            function failed(response) {
                $log.error(response);
            }

            AuthService
                .register(credentials)
                .then(success, failed);
        }

    }
})();

(function () {
    'use strict';

    angular
        .module('main')
        .service('AuthService', function ($http, $cookieStore, $rootScope, $q, URL, BUCKET_SLUG) {
            var authService = this;

            authService.login = function (credentials) {

                // , {
                //     params: {
                //         metafield_key: ['username', 'password'],
                //             metafield_value: [credentials.username, credentials.password]
                //     }
                // }
                
                return $http.get(URL + BUCKET_SLUG + '/object/' + credentials.username);
            };

            authService.register = function (credentials) {
                return $http.post(urlBase + 'admin', credentials);
            };

            authService.setCredentials = function (user) {
                $rootScope.globals = {
                    currentUser: user
                };

                $http.defaults.headers.common['Authorization'] = user.token;
                $cookieStore.put('globals', $rootScope.globals);
            };

            authService.clearCredentials = function () {
                var deferred = $q.defer();
                $cookieStore.remove('globals');

                if (!$cookieStore.get('globals')) {
                    $rootScope.globals = {};
                    $http.defaults.headers.common.Authorization = '';
                    deferred.resolve('Credentials clear success');
                } else {
                    deferred.reject('Can\'t clear credentials');
                }

                return deferred.promise;
            };

            authService.getRoles = function () {
                return _roles;
            };

            authService.getPrettyRoles = function () {
                return _prettyRoles;
            };

            authService.getRoleById = function (id) {
                return authService.getRoles()[id];
            };

            authService.getRoleByIdPretty = function (id) {
                return authService.getPrettyRoles()[id];
            };

            authService.getCurrentUser = function () {
                var user = $rootScope.globals.currentUser;
                user.role = authService.getRoleByIdPretty($rootScope.globals.currentUser.role);
                return user;
            }

        });  
})();  
(function () {
    'use strict';

    var app = angular
                .module('main');

    app.constant('BUCKET_SLUG', 'events');
    app.constant('URL', 'https://api.cosmicjs.com/v1/');
    app.constant('MEDIA_URL', 'https://api.cosmicjs.com/v1/events/media');
    app.constant('MEDIA_URL_USERs', 'https://api.cosmicjs.com/v1/events/media?folder=users');
    app.constant('MEDIA_URL_EVENTS', 'https://api.cosmicjs.com/v1/events/media?folder=events');

})();

