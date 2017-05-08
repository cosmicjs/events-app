(function () {
    'use strict';
    
    angular
        .module('event', [ 
            'event.profile',
            'event.feed',
            'event.add'
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
 