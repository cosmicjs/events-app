(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('UserCtrl', UserCtrl);

    function UserCtrl($rootScope, $scope, $state, AuthService, Flash, $log) {
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

        $scope.state = $state;

        // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        //     // if (toState.resolve) {
        //         console.log(false);
        //     // }
        // });
        // $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        //     // if (toState.resolve) {
        //         // $scope.hideSpinner();
        //         console.log(true);
        //
        //     // }
        // });

    }
})();
