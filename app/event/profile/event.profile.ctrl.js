(function () {
    'use strict'; 

    angular
        .module('main')
        .controller('EventProfileCtrl', EventProfileCtrl);

    function EventProfileCtrl($timeout, $stateParams, EventService, Notification, $log, Flash) {
        var vm = this;

        vm.getEvent = getEvent;
        vm.updateEvent = updateEvent;
        
        vm.dateBeginPicker = false;
        vm.dateEndPicker = false;

        vm.contentEditor = false;
        
        vm.event = {}; 

        function getEvent() {
            function success(response) {
                $log.info(response);

                vm.event = response.data.object;

                vm.event.metafields[2].value = new Date(response.data.object.metadata.date_begin);
                vm.event.metafields[3].value = new Date(response.data.object.metadata.date_end);

                console.log(response.data.object);

                // vm.event.content = $sce.trustAsHtml(response.data.object.content);
            }

            function failed(response) {
                $log.error(response);
            }

            EventService
                .getEventById($stateParams.slug)
                .then(success, failed);
        }
        
        function updateEvent(event) {
            function success(response) {
                $log.info(response);

                Notification.primary(
                    {
                        message: 'Saved',
                        delay: 800,
                        replaceMessage: true
                    }
                );
            }

            function failed(response) {
                $log.error(response);
            }

            EventService
                .updateEvent(event)
                .then(success, failed);
        }

    }
})();
