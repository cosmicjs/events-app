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
            
            'event'
        ])
        .config(config)
        .run(run);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise(function ($injector) {
            var $state = $injector.get("$state");
            var $location = $injector.get("$location");
            var crAcl = $injector.get("crAcl");

            var state = "";

            switch (crAcl.getRole()) {
                case 'ROLE_USER':
                    state = 'main.event';
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
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('AuthCtrl', AuthCtrl);

    function AuthCtrl(crAcl, $state, AuthService, Flash, $log) {
        var vm = this;              

        vm.login = login;
        vm.register = register;
        
        vm.showRegisterForm = false;
        
        vm.loginForm = null;
        vm.registerForm = null;
        
        vm.credentials = {};
        vm.user = {};

        function login(credentials) {
            function success(response) {
                function success(response) {
                    if (response.data.status !== 'empty') {
                        var currentUser = response.data.objects[0];

                        crAcl.setRole(currentUser.metadata.role);
                        AuthService.setCredentials(currentUser);
                        $state.go('main.event');
                    }
                    else
                        Flash.create('danger', 'Incorrect username or password');
                }

                function failed(response) {
                    $log.error(response);
                }

                if (response.data.status !== 'empty')
                    AuthService
                        .checkPassword(credentials)
                        .then(success, failed);
                else
                    Flash.create('danger', 'Incorrect username or password');

                $log.info(response);
            }

            function failed(response) {
                $log.error(response);
            }

            if (vm.loginForm.$valid)
                AuthService
                    .checkUsername(credentials)
                    .then(success, failed);
        }

        function register(credentials) {
            function success(response) {
                $log.info(response);

                var currentUser = response.data.object.metafields;

                Flash.create('success', 'You have successfully signed up!');
                vm.credentials = {
                    username: currentUser[0].value,
                    password: currentUser[3].value
                };
                vm.showRegisterForm = false;
            }

            function failed(response) {
                $log.error(response);
            }

            if (vm.registerForm.$valid)
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
        .service('AuthService', function ($http, 
                                          $cookieStore, 
                                          $q, 
                                          $rootScope, 
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY) {
            var authService = this;
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            authService.checkUsername = function (credentials) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/users/search', {
                    params: {
                        metafield_key: 'username',
                        metafield_value_has: credentials.username,
                        limit: 1,
                        read_key: READ_KEY
                    }
                });
            };
            authService.checkPassword = function (credentials) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/users/search', {
                    params: {
                        metafield_key: 'password',
                        metafield_value: credentials.password,
                        limit: 1,
                        read_key: READ_KEY
                    }
                });
            };
            authService.register = function (user) {

                return $http.post(URL + BUCKET_SLUG + '/add-object', {
                    title: user.full_name,
                    type_slug: 'users',
                    slug: user.username,
                    metafields: [
                        {
                            key: "username",
                            type: "text",
                            value: user.username
                        },
                        {
                            key: "email",
                            type: "text",
                            value: user.email
                        },
                        {
                            key: "full_name",
                            type: "text",
                            value: user.full_name 
                        },
                        {
                            key: "password",
                            type: "text",
                            value: user.password
                        },
                        {
                            key: "image",
                            type: "file",
                            value: "3b2180f0-2c40-11e7-85ac-e98751218524-1493421969_male.png"
                        },
                        {
                            key: "role",
                            type: "radio-buttons",
                            options: [
                                {
                                    value: "ROLE_USER"
                                },
                                {
                                    value: "ROLE_SUPER_ADMIN"
                                }
                            ],
                            value: "ROLE_USER"
                        }
                    ],

                    write_key: WRITE_KEY
                });
            };
            authService.setCredentials = function (user) {
                $rootScope.globals = {
                    currentUser: user
                };
                
                $cookieStore.put('globals', $rootScope.globals);
            };
            authService.clearCredentials = function () {
                var deferred = $q.defer();
                $cookieStore.remove('globals');

                if (!$cookieStore.get('globals')) {
                    $rootScope.globals = {};
                    deferred.resolve('Credentials clear success');
                } else {
                    deferred.reject('Can\'t clear credentials');
                }

                return deferred.promise;
            };
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
    app.constant('READ_KEY', 'NSAzCEjy62aPHj4tpUNrzeBY3IBfFDHPK67A9eqIOGsZqgztnf');
    app.constant('WRITE_KEY', 'GXQFFuUibgOtKB29ywtKwwXdpFK29fBZrBnO3YjtfTcV6qkpld');

})();


(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('EventCtrl', EventCtrl);

    function EventCtrl(crAcl, $state, EventService, Flash, $log) {
        var vm = this;
        
        vm.getEvents = getEvents;

        function getEvents(username) {
            function success(response) {
                $log.info(response);

                vm.events = response.data.objects;
            }

            function failed(response) {
                $log.error(response);
            }

            EventService
                .getEvents(username)
                .then(success, failed);
        }
    }
})();

(function () {
    'use strict';
    
    angular
        .module('event', [
            'event.profile'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.event', {
                url: 'events',
                views: {
                    '': {
                        templateUrl: '../views/event/events.html',
                        controller: 'EventCtrl as vm'
                    }
                },
                data: {
                    is_granted: ['ROLE_USER']
                }
            });
    }
    
})();
 
(function () {
    'use strict';

    angular
        .module('main')
        .service('EventService', function ($http,
                                          $cookieStore, 
                                          $q, 
                                          $rootScope, 
                                          URL, BUCKET_SLUG, READ_KEY, WRITE_KEY) {
            var authService = this;
            $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

            authService.getEvents = function (username) {
                return $http.get(URL + BUCKET_SLUG + '/object-type/events/search', {
                    params: {
                        metafield_key: 'user',
                        metafield_object_slug: username,
                        limit: 10,
                        read_key: READ_KEY
                    }
                });
            };
            authService.getEventById = function (slug) {
                return $http.get(URL + BUCKET_SLUG + '/object/' + slug, {
                    params: {
                        read_key: READ_KEY
                    }
                });
            };
            authService.register = function (user) {

                return $http.post(URL + BUCKET_SLUG + '/add-object', {
                    title: user.full_name,
                    type_slug: 'users',
                    slug: user.username,
                    metafields: [
                        {
                            key: "username",
                            type: "text",
                            value: user.username
                        },
                        {
                            key: "email",
                            type: "text",
                            value: user.email
                        },
                        {
                            key: "full_name",
                            type: "text",
                            value: user.full_name 
                        },
                        {
                            key: "password",
                            type: "text",
                            value: user.password
                        },
                        {
                            key: "image",
                            type: "file",
                            value: "3b2180f0-2c40-11e7-85ac-e98751218524-1493421969_male.png"
                        },
                        {
                            key: "role",
                            type: "radio-buttons",
                            options: [
                                {
                                    value: "ROLE_USER"
                                },
                                {
                                    value: "ROLE_SUPER_ADMIN"
                                }
                            ],
                            value: "ROLE_USER"
                        }
                    ],

                    write_key: WRITE_KEY
                });
            };
        });
})();  
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($rootScope, crAcl, $state, AuthService, Flash, $log) {
        var vm = this;
        
        vm.currentUser = $rootScope.globals.currentUser.metadata;
        
        vm.logout = logout;

        function logout() {
            function success(response) {
                $state.go('auth');

                $log.info(response);
            }

            function failed(response) {
                $log.error(response);
            }

            AuthService
                .clearCredentials()
                .then(success, failed);
        }

    }
})();

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
 
(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('EventProfileCtrl', EventProfileCtrl);

    function EventProfileCtrl(crAcl, $stateParams, EventService, $sce, $log) {
        var vm = this;
        
        vm.getEvent = getEvent;

        function getEvent() {
            function success(response) {
                $log.info(response);

                vm.event = response.data.object;
                vm.event.content = $sce.trustAsHtml(response.data.object.content);
            }

            function failed(response) {
                $log.error(response);
            }

            EventService
                .getEventById($stateParams.slug)
                .then(success, failed);
        }
    }
})();

(function () {
    'use strict';
    
    angular
        .module('event.profile', [])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];
    function config($stateProvider, $urlRouterProvider) {
 
        $stateProvider
            .state('main.event.profile', {
                url: '/:slug',
                views: {
                    '@main': {
                        templateUrl: '../views/event/event.profile.html',
                        controller: 'EventProfileCtrl as vm'
                    }
                },
                data: {
                    is_granted: ['ROLE_USER']
                }
            });
    }
    
})();
 