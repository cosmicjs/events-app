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
                AuthService.setCredentials(
                    response.data.data
                );

                crAcl.setRole();

                switch (crAcl.getRole()) {
                    case 'ROLE_USER':
                        $state.go('main');
                        break;
                }

                $log.info(response);
            }

            function failed(response) {
                Flash.create('danger', response.data.message);
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
