(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name infinity.angular-chosen.directive:chosen
   * @description
   * # This is an AngularJS directive of the jQuery Chosen plugin.
   */
  angular
    .module('infinity.angular-chosen')
    .directive('chosen', function () {
      // LIST OF JQUERY EVENTS WHICH WOULD BE EXPOSED TO THE USERS OF THIS
      // DIRECTIVE. THESE EVENTS ARE FOR CHOSEN'S INPUT BOX.
      var JQUERY_EVENTS = [
        'Keydown',
        'Keypress',
        'Keyup'
      ];
      // UNIQUE REFERENCE TO THE SEARCH INPUT BOX OF CHOSEN
      var $chosenInput = undefined;

      function link(scope, element, attrs) {
        // LISTENER THAT IS EXECUTED WHENEVER A VALUE IN THE
        // DATA IS CHANGED. LAST ARGUMENT OF $watch IS true
        // TO USE angular.equals INSTEAD OF COMPARING REFERENCE EQUALITY.
        scope
          .$watch(attrs.chosenData, triggerChosenUpdate.bind(undefined, element), true);

        // LISTENER THAT IS EXECUTED WHENEVER THE VALUE OF THE ngModel
        // GETS CHANGED SO THAT CHOSEN IS UPDATED EVEN IF THE VALUE WAS
        // CHANGED FROM SOMEWHERE ELSE (OUTSIDE THIS DIRECTIVE).
        scope
          .$watch(attrs.ngModel, triggerChosenUpdate.bind(undefined, element));

        // CALLS THE CHOSEN'S INIT FUNCTION ON THE element
        element
          .chosen(scope.$eval(attrs.chosen))    // EVALUATES STRING INTO OBJECT REFERENCE
          .change(scope.$eval(attrs.chosenOnChange));  // EVALUATES STRING INTO FUNCTION REFERENCE

        // STORING REFERENCE TO CHOSEN'S SEARCH INPUT BOX AFTER CHOSEN HAS BEEN INITIALIZED.
        $chosenInput = $(makeChosenId(attrs.id) + ' .chosen-search > input');

        // ATTACHES EVENT LISTENERS TO JQUERY EVENTS IF THE USER HAS
        // PROVIDED THEM.
        JQUERY_EVENTS
          .forEach(function (eventName) {
            var attr = attrs['chosen' + eventName]; // MAKES AN ATTRIBUTE STRING
            if (!attr) { return; } // RETURNS IF THE USER DID NOT PROVIDE LISTENER FOR THIS EVENT

            $chosenInput
              .on(eventName.toLowerCase(), function () {
                var cb = scope.$eval(attr); // EVALUATES THE STRING TO A CALLBACK FUNCTION
                cb(this.value);
              });
          });
      }

      // TAKES THE id ATTRIBUTE FROM SELECT AND MAKES THE RESPECTED
      // CHOSEN id FROM IT.
      function makeChosenId(id) {
        id = id.replace('-', '_');
        id += '_chosen';

        return '#' + id;
      }

      // TRIGGERS A DYNAMIC UPDATE ON CHOSEN, AS WELL AS MAINTAINS THE
      // VALUE OF INPUT BOX FOR AUTOCOMPLETE FUNCTIONALITY TO WORK PROPERLY.
      function triggerChosenUpdate(element) {
        // STORE INPUT VALUE BEFORE THE CHOSEN GETS DYNAMICALLY UPDATED
        var inputVal = $chosenInput.val();

        element
          .trigger('chosen:updated');

        // RESTORE INPUT VALUE AFTER CHOSEN HAS UPDATED
        $chosenInput.val(inputVal);
      }

      // RETURNS THE DIRECTIVE OBJECT
      return {
        link: link,
        priority: 1,
        restrict: 'A' // CAN ONLY BE USED AS AN ATTRIBUTE
      };

    });

})();
