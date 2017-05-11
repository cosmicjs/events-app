(function () {
    'use strict';

    var app = angular
                .module('main');

    // app.constant('BUCKET_SLUG', 'events');
    app.constant('URL', 'https://api.cosmicjs.com/v1/');
    // app.constant('MEDIA_URL', 'https://api.cosmicjs.com/v1/events/media');
    // app.constant('READ_KEY', 'NSAzCEjy62aPHj4tpUNrzeBY3IBfFDHPK67A9eqIOGsZqgztnf');
    // app.constant('WRITE_KEY', 'GXQFFuUibgOtKB29ywtKwwXdpFK29fBZrBnO3YjtfTcV6qkpld');
    app.constant('DEFAULT_EVENT_IMAGE', 'https://cosmicjs.com/uploads/ce6ed110-31da-11e7-aef2-87741016d54e-no_image.png');

})();

