angular.module('starter.controllers', [])

    .controller('SecureStorageCtrl', function ($scope) {
        var self = this;

        self.loading = true;

        self.storeFile = function () {
            self.imgSrc = null;
            self.loading = true;
            appworks.storage.storeFile('file.jpg', 'http://thecatapi.com/api/images/get', function () {
                self.loading = false;
                $scope.$apply();
            });
        };

        self.getFile = function () {
            appworks.storage.getFile('file.jpg', function (dataUrl) {
                self.imgSrc = dataUrl;
                $scope.$apply();
            });
        }
    })

    .controller('CacheCtrl', function () {

        var self = this;

        self.key = 'myKey';
        self.data = 1234;

        self.setItem = function (key, data) {
            self.data = null;
            self.cacheData = null;
            appworks.cache.setItem(key, data);
        };

        self.getItem = function (key) {
            appworks.cache.getItem(key, function (data) {
                if (!data) {
                    alert('This key does not exist in the cache');
                }
                self.cacheData = data;
            });
        };

        self.clear = function () {
            self.cacheData = null;
            self.key = null;
            self.data = null;
            appworks.cache.clear();
            self.$applyAsync();
        };
    })

    .controller('OfflineCtrl', function ($scope, $timeout) {
        var self = this,
            url = 'https://randomuser.me/api/',
            options1 = {eventListener: 'myEvent1', method: 'GET'},
            options2 = {eventListener: 'myEvent2', method: 'GET'},
            options3 = {eventListener: 'myEvent3', method: 'GET'};

        self.users = [];

        self.queue = function (options) {
            self.err = null;
            if (options) {
                appworks.offline.queue(options.url, options.options).then(options.success, options.error);
            } else {
                appworks.offline.queue(url, options1).then(successFn, errorFn);
            }
        };

        self.queueMultiple = function () {
            self.users = [];
            $timeout(function () {
                self.queue({url: url, options: options1, success: successFn, error: errorFn});
            }, 1000);
            $timeout(function () {
                self.queue({url: url, options: options2, success: successFn2, error: errorFn});
            }, 1000);
            $timeout(function () {
                self.queue({url: url, options: options3, success: successFn3, error: errorFn});
            }, 1000);
        };

        function addUser(user) {
            $scope.$apply(self.users.push(user));
        }

        function successFn(res) {
            res = JSON.parse(res.data);
            addUser(res.results[0]);
            appworks.offline.removeEventHandler('myEvent1', successFn);
        }

        function successFn2(res) {
            res = JSON.parse(res.data);
            addUser(res.results[0]);
            appworks.offline.removeEventHandler('myEvent2', successFn2);
        }

        function successFn3(res) {
            res = JSON.parse(res.data);
            addUser(res.results[0]);
            appworks.offline.removeEventHandler('myEvent3', successFn3);
        }

        function errorFn(err) {
            $scope.$apply(self.err = err);
        }
    })

    .controller('DeviceCtrl', function ($scope) {
        var self = this;

        self.openCamera = function () {
            self.err = null;
            self.imgSrc = null;
            appworks.camera.takePicture(function (dataUrl) {
                $scope.$apply(self.imgSrc = dataUrl);
            }, function (err) {
                $scope.$apply(self.err = err);
            });
        };

        self.openGallery = function () {
            self.err = null;
            self.imgSrc = null;
            appworks.camera.chooseFromLibrary(function (dataUrl) {
                $scope.$apply(self.imgSrc = dataUrl);
            }, function (err) {
                $scope.$apply(self.err = err);
            });
        };

        self.triggerNotification = function () {
            appworks.notification.schedule({
                id: 1,
                text: 'Notification triggered via appworksJS',
                icon: 'http://www.optimizeordie.de/wp-content/plugins/social-media-widget/images/default/64/googleplus.png',
                sound: null,
                data: {test:1}
            });
            self.syncNotifications();
        };

        self.clearNotifications = function () {
            self.notifications = [];
            appworks.notification.clearAll();
        };

        self.getNotifications = function (callback) {
            appworks.notification.getAll(callback);
        };

        self.syncNotifications = function () {
            self.getNotifications(function (notifications) {
                $scope.$applyAsync(self.notifications = notifications);
            });
        };

        self.syncNotifications();

    });
