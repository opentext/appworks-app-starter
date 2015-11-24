angular.module('starter.controllers', [])

    .controller('FileCtrl', function ($scope) {
        var self = this;

        self.loading = true;

        self.openFile = function (filename) {
            var finder = new Appworks.Finder(showContents, showContents);

            function showContents(data) {
                console.log(data);
                $scope.$apply(self.openedFile = data);
            }

            finder.open('/', filename);
        };

        self.listDirectory = function () {
            var finder = new Appworks.Finder(showContents, showContents);

            function showContents(data) {
                console.log(data);
                $scope.$apply(self.openedDirectory = data);
            }

            finder.list('/');
        };

        self.storeFile = function () {
            var storage = new Appworks.SecureStorage(setFile, stopLoading);
            self.imgSrc = null;
            self.loading = true;
            self.showStoredFileAsImage = false;

            function setFile(file) {
                self.storedFile = file.nativeURL;
                stopLoading();
            }

            function stopLoading() {
                console.log('AWJS: File downloaded successfully.');
                self.loading = false;
                $scope.$apply();
            }

            storage.store('http://thecatapi.com/api/images/get', 'file.jpg');
        };

        self.downloadFile = function (shared) {
            var fileTransfer = new Appworks.AWFileTransfer(showFile, errorHandler);

            function showFile(file) {
                console.log(file);
                self.downloadedFile = file.nativeURL;
                $scope.$apply();
            }

            fileTransfer.progressHandler(function (progress) {
                console.log(progress);
            });

            fileTransfer.download('http://thecatapi.com/api/images/get', 'file.jpg');
        };

        self.downloadFileShared = function () {
            var fileTransfer = new Appworks.AWFileTransfer(showFile, errorHandler);

            function showFile(file) {
                console.log(file);
                self.downloadedFileShared = file;
                $scope.$apply();
            }

            fileTransfer.download('http://thecatapi.com/api/images/get', 'file.jpg', null, true);
        };

        self.getFile = function () {
            var storage = new Appworks.SecureStorage(showImage, errorHandler);

            self.showStoredFileAsImage = false;

            function showImage(file) {
                self.storedFile = file.nativeURL;
                self.showStoredFileAsImage = true;
                $scope.$apply();
            }

            storage.retrieve('file.jpg');
        };

        function errorHandler(err) {
            console.log(err);
            self.loading = false;
            $scope.$apply();
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

        self.notifications = [];
        self.notificationsEnabled = true;

        $scope.$watch('device.notificationsEnabled', function (on) {
            if (on) {
                self.enableNotifications();
            } else {
                self.stopNotifications();
            }
        });

        self.getDeviceInfo = function () {
            var device = new Appworks.AWDevice();
            var info = {
                cordova: device.cordova,
                model: device.model,
                platform: device.platform,
                uuid: device.uuid,
                version: device.version,
                manufacturer: device.manufacturer
            };
            alert(JSON.stringify(info));
        };

        self.scanQRCode = function () {
            var qrScanner = new Appworks.QRReader(onScan, onScan);

            qrScanner.scan();

            function onScan(data) {
                $scope.$apply(self.qrScanResult = data);
            }
        };

        self.openContactPicker = function () {
            var contacts = new Appworks.AWContacts(onContactSuccess, errorHandler);

            function onContactSuccess(contact) {
                self.contactPickerResult = {
                    name: contact.name.formatted,
                    number: contact.phoneNumbers[0].value,
                    photo: contact.photos && contact.photos[0].value
                };
                console.log('selected contact:', contact);
                $scope.$apply();
            }

            contacts.pickContact();
        };

        function errorHandler(err) {
            console.log(err);
        }

        self.openCamera = function () {
            var camera = new Appworks.AWCamera(function (dataUrl) {
                $scope.$apply(self.imgSrc = dataUrl);
            }, function (err) {
                self.err = err;
                $scope.$apply();
            });
            self.err = null;
            self.imgSrc = null;
            camera.takePicture();
        };

        self.openGallery = function () {
            var gallery = new Appworks.AWCamera(function (dataUrl) {
                $scope.$apply(self.imgSrc = dataUrl);
            }, function (err) {
                self.err = err;
                $scope.$apply();
            });
            self.err = null;
            self.imgSrc = null;
            gallery.openGallery();
        };

        self.getLocation = function () {
            var geo = new Appworks.AWLocation(onSuccess, onError);

            geo.getCurrentPosition();

            function onSuccess(position) {
                console.log(position);
                alert(
                    'Latitude: '          + position.coords.latitude          + '\n' +
                    'Longitude: '         + position.coords.longitude         + '\n' +
                    'Altitude: '          + position.coords.altitude          + '\n' +
                    'Accuracy: '          + position.coords.accuracy          + '\n' +
                    'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                    'Heading: '           + position.coords.heading           + '\n' +
                    'Speed: '             + position.coords.speed             + '\n' +
                    'Timestamp: '         + position.timestamp                + '\n');
            }

            function onError(err) {
                console.log(err);
                alert('Unable to get current location.' +
                    ' In general this means the device has no network connectivity and/or cannot get a satellite fix');
            }
        };

        //Appworks.Notifications.handler(function (notification) {
        //    $scope.$apply(self.notifications.push(notification));
        //});

        self.clearNotifications = function () {
            self.notifications = [];
        };

        //self.stopNotifications = function () {
        //    appworks.notifications.off();
        //};

        //self.enableNotifications = function () {
        //    appworks.notifications.on();
        //};

        self.getNotifications = function () {
            self.syncNotifications();
        };

        //self.syncNotifications = function () {
        //    $scope.$applyAsync(self.notifications = appworks.notifications.get());
        //};
    })

    .controller('AuthCtrl', function ($scope) {

        var auth = new Appworks.Auth(onAuth, onAuth);

        function onAuth(data) {
            console.log(data);
            $scope.$apply($scope.response = data.data);
        }

        this.authenticate = function () {
            auth.authenticate();
        };
    });
