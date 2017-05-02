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