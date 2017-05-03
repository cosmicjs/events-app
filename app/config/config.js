(function () {
    'use strict';

    var app = angular
                .module('main');

    app.constant('BUCKET_SLUG', 'events');
    app.constant('URL', 'https://api.cosmicjs.com/v1/');
    app.constant('MEDIA_URL', 'https://api.cosmicjs.com/v1/events/media');
    app.constant('MEDIA_URL_USERs', 'https://api.cosmicjs.com/v1/events/media?folder=users');
    app.constant('MEDIA_URL_EVENTS', 'https://api.cosmicjs.com/v1/events/media?folder=events');
    app.constant('READ_KEY', 'NSAzCEjy62aPHj4tpUNrzeBY3IBfFDHPK67A9eqIOGsZqgztnf');
    app.constant('WRITE_KEY', 'GXQFFuUibgOtKB29ywtKwwXdpFK29fBZrBnO3YjtfTcV6qkpld');

})();

