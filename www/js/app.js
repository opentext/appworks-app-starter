// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .config(function($compileProvider){
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|assets-library):|data:image\//);
    })

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.file', {
                url: '/file',
                views: {
                    'tab-file': {
                        templateUrl: 'templates/tab-file.html',
                        controller: 'FileCtrl as file'
                    }
                }
            })

            .state('tab.cache', {
                url: '/cache',
                views: {
                    'tab-cache': {
                        templateUrl: 'templates/tab-cache.html',
                        controller: 'CacheCtrl as cache'
                    }
                }
            })
            .state('tab.offline', {
                url: '/offline',
                views: {
                    'tab-offline': {
                        templateUrl: 'templates/tab-offline.html',
                        controller: 'OfflineCtrl as offline'
                    }
                }
            })
            .state('tab.auth', {
                url: '/auth',
                views: {
                    'tab-auth': {
                        templateUrl: 'templates/tab-auth.html',
                        controller: 'AuthCtrl as auth'
                    }
                }
            })
            .state('tab.device', {
                url: '/device',
                views: {
                    'tab-device': {
                        templateUrl: 'templates/tab-device.html',
                        controller: 'DeviceCtrl as device'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/file');

    });
