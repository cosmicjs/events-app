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
