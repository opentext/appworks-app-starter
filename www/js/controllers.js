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
        self.cache = new Appworks.AWCache();

        self.setItem = function (key, data) {
            self.data = null;
            self.cacheData = null;
            self.cache.setItem(key, data);
        };

        self.getItem = function (key) {
            self.cacheData = self.cache.getItem(key);
        };

        self.clear = function () {
            self.cacheData = null;
            self.key = null;
            self.data = null;
            self.cache.clear();
        };
    })

    .controller('OfflineCtrl', function ($scope, $timeout, $http) {
        var self = this,
            offlineManager = new Appworks.AWOfflineManager({preserveEvents: true});

        self.users = [];
        self.defer = makeRequest;
        self.offlineEventId = null;

        self.defer = function () {
            // want to show that arguments are preserved, so I will call makeRequest with a url I define in here
            // when the offline event is processed the arguments I tried to call makeRequest with will be preserved.
            var url = 'https://randomuser.me/api/';
            makeRequest(url);
        };

        // we add an event listener outside any inner functions so that if the device turns completely off and
        // on again, as soon as this controller is loaded this event listener will be registered.
        //
        // there will be a 5 second delay between when the appworksjs.processingDeferredQueue event gets fired and
        // when the processing takes place.
        //
        // if there is a custom event (e.g. via defer()) in that deferred queue, an event listener
        // function should be registered here or earlier to ensure the event gets processed.
        // this is the same event listener we registered with defer() on line 163
        document.addEventListener('makeRequestEv', gotDeferred);

        function gotDeferred(data) {
            // the device is online now so we try to make the request again using the original arguments.
            console.log(data);
            var url = JSON.parse(data.detail)[0];
            makeRequest(url);
        }

        function makeRequest(url) {
            // if the device is online, we make the request right away
            // otherwise, we queue the request to be processed later, and preserve any arguments that this method
            // was called with
            if (offlineManager.networkStatus().online) {
                // make the request
                $http.get(url).then(addUser, errorFn);
                // we set up offlineManager to remove events manually by providing {preserveEvents: true}, so now
                // that we have made the request, we remove the event from the deferred queue using the id passed
                // back to us when we called defer()
                offlineManager.cancel(self.offlineEventId);
            } else {
                self.offlineEventId = offlineManager.defer('makeRequestEv', arguments);
                console.log(self.offlineEventId);
            }
        }

        function addUser(response) {
            var user = response.data.results[0];
            self.users.push(user);
            console.log(response);
        }

        function errorFn(err) {
            self.err = err;
        }
    })

    .controller('DeviceCtrl', function ($scope, $ionicModal) {
        var self = this;

        self.notifications = [];
        self.notificationsEnabled = true;

        $ionicModal.fromTemplateUrl('templates/modals/device-motion.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.deviceMotionModal = modal;
            $scope.hideDeviceMotionModal = function () {
                $scope.accelerometer.clearWatch($scope.deviceMotionWatchId);
                $scope.accelerometer = null;

                $scope.compass.clearWatch($scope.deviceOrientationWatchId);
                $scope.compass = null;

                $scope.deviceMotionModal.hide();
            }
        });

        $scope.$watch('device.notificationsEnabled', function (on) {
            if (on) {
                self.enableNotifications();
            } else {
                self.stopNotifications();
            }
        });

        self.getDeviceInfo = function () {
            var device = new Appworks.AWDevice(),
                alertManager = new Appworks.AWNotificationManager();
            var info = {
                cordova: device.cordova,
                model: device.model,
                platform: device.platform,
                uuid: device.uuid,
                version: device.version,
                manufacturer: device.manufacturer
            };
            alertManager.alert(JSON.stringify(info));
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

        self.showCompass = function () {
            $scope.accelerometer = new Appworks.AWAccelerometer(accelerationUpdate, errorHandler);
            $scope.compass = new Appworks.AWCompass(compassUpdate, errorHandler);
            $scope.deviceMotionModal.show();
            $scope.deviceMotionWatchId = $scope.accelerometer.watchAcceleration();
            $scope.deviceOrientationWatchId = $scope.compass.watchHeading();
        };

        function compassUpdate(heading) {
            $scope.currentHeading = heading;
            $scope.$apply();
        }

        function accelerationUpdate(acceleration) {
            $scope.currentAcceleration = acceleration;
            $scope.$apply();
        }

        self.recordAudio = function () {
            if ($scope.recordingInProgress) {
                $scope.recording.stopRecord();
                $scope.recordingInProgress = false;
            } else {
                $scope.recording = new Appworks.AWMedia('documents://recording.wav', onRecordSuccess, errorHandler);
                $scope.recording.startRecord();
                $scope.recordingInProgress = true;
            }
        };

        function onRecordSuccess(media) {
            $scope.$apply();
        }

        self.playAudio = function () {
            console.log($scope.recording);
            var src = $scope.recording && $scope.recording.src;

            if ($scope.playingHasStarted && $scope.playing) {
                $scope.media.pause();
                $scope.playing = false;
            } else if ($scope.playingHasStarted) {
                $scope.media.play();
                $scope.playing = true;
            } else {
                if (!src) {
                    console.log('playing a sample');
                    src = 'https://api.soundcloud.com/tracks/205365019/download?client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea&oauth_token=1-138878-53859839-4dcd0ce624b390';
                }
                $scope.media = new Appworks.AWMedia(src, onMediaEnded, errorHandler);
                $scope.media.play();
                $scope.playingHasStarted = true;
                $scope.playing = true;
            }
        };

        function onMediaEnded() {
            console.log('audio has ended');
            $scope.playingHasStarted = false;
            $scope.playing = false;
            $scope.$apply();
        }

        self.recordVideo = function () {
            var recorder = new Appworks.AWMediaCapture(onRecordSuccess, errorHandler);
            recorder.captureVideo();
        };

        function errorHandler(err) {
            console.log(err);
        }

        self.openCamera = function () {
            var camera = new Appworks.AWCamera(function (dataUrl) {
                self.imgSrc = dataUrl;
                $scope.$apply();
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
                self.imgSrc = dataUrl;
                $scope.$apply();
            }, function (err) {
                self.err = err;
                $scope.$apply();
            });
            self.err = null;
            self.imgSrc = null;
            gallery.openGallery();
        };

        self.vibrate = function () {
            var vibe = new Appworks.AWVibration();
            vibe.vibrate(4000);
        };

        self.getLocation = function () {
            var geo = new Appworks.AWLocation(onSuccess, onError),
                alertManager = new Appworks.AWNotificationManager();

            geo.getCurrentPosition();

            function onSuccess(position) {
                console.log(position);
                alertManager.alert(
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
                alertManager.alert('Unable to get current location.' +
                    ' In general this means the device has no network connectivity and/or cannot get a satellite fix');
            }
        };
    })

    .controller('SyncCtrl', function ($scope) {

        var auth = new Appworks.Auth(onAuth, onAuth),
            notificationManager = new Appworks.AWNotificationManager(),
            alertManager = new Appworks.AWNotificationManager();

        function onAuth(data) {
            console.log(data);
            $scope.$apply($scope.response = data.data);
        }

        function errorHandler(err) {
            console.log(err);
        }

        this.authenticate = function () {
            auth.authenticate();
        };

        this.getNotifications = function () {
            notificationManager.getNotifications(function (notifications) {
                console.log(notifications);
                $scope.notifications = notifications;
                $scope.$apply();
            });
        };

        $scope.$watch('sync.notificationsEnabled', function (enabled) {
            if (enabled) {
                notificationManager.enablePushNotifications(function (notification) {
                    console.log(notification);
                    alertManager.alert(JSON.stringify(notification));
                }, errorHandler);
            } else {
                notificationManager.disablePushNotifications();
            }
        });

    });
