(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('EventCtrl', EventCtrl);

    function EventCtrl(EventService, Notification, $log, $rootScope, DEFAULT_EVENT_IMAGE) {
        var vm = this;

        vm.getEvents = getEvents;
        vm.removeEvent = removeEvent;
        vm.DEFAULT_EVENT_IMAGE = DEFAULT_EVENT_IMAGE;

        function getEvents(username) {
            function success(response) {
                $log.info(response);

                vm.events = response.data.objects;
            }

            function failed(response) {
                $log.error(response);
            }
            console.log(username);

            EventService
                .getEventsByUsername(username)
                .then(success, failed);
        }

        function removeEvent(slug) {
            function success(response) {
                $log.info(response);

                getEvents($rootScope.globals.currentUser.metadata.username);

                Notification.success('Deleted');
            }

            function failed(response) {
                Notification.error(response.data.message);
                
                $log.error(response);
            }

            EventService
                .removeEvent(slug)
                .then(success, failed);
        }
    }
})();
