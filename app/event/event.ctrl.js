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
