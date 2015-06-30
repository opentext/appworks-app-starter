/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function nextDemo(current, next) {
    current = document.getElementById(current);
    next = document.getElementById(next);
    
    current.setAttribute('style', 'display:none');
    next.setAttribute('style', 'display: inline-block');
}

function beginDemo() {
    nextDemo('begin', 'storeRequest');
}

function storeRequest() {
    var url = 'http://thecatapi.com/api/images/get',
        options = {eventListener: 'catEvent', method: 'GET'};
    
    appworks.offline.registerEventHandler('catEvent', function (cat) {
        console.log(cat);
        alert('got cat');
        nextDemo('storeRequest', 'storeFile');
    });
    appworks.offline.queue(url, options);
}

function storeFile() {
    console.log('storing file...');
    
    appworks.storage.storeFile('file.jpg', 'http://thecatapi.com/api/images/get', function () {
        alert('file stored!');
        nextDemo('storeFile', 'getFile');
    });
}

function getFileFromStorage() {
    console.log('getting file...');
    
    appworks.storage.getFile('file.jpg', function (dataUrl) {
        var el = document.querySelector('body');
        
        el.setAttribute('style', 'background: url(' + dataUrl + ') no-repeat; background-size: cover;');
        nextDemo('getFile', 'cacheData');
        
    }, function (err) {
        console.log(err)
    });
}

function setItemInCache(options, skip) {
    var item = Math.random(),
        el = document.querySelector('body');
        // remove the cat picture
        el.setAttribute('style', 'background: url("")');
    
    console.log('setting item in cache: (mykey, ' + item + ')');
    appworks.cache.setItem('myKey', item, options);
    
    if (skip) { return }
    nextDemo('cacheData', 'getData');
}

function getItemFromCache(skip) {
    console.log('gettting item from cache with key: myKey');
    appworks.cache.getItem('myKey', function (item) {
        alert(item);
        skip ? nextDemo('getDataAfterExpiry', 'clearCache') : nextDemo('getData', 'cacheDataWithOptions');
    });
}

function setItemInCacheWithOptions() {
    console.log('setting item in cache with an expiration of 15 seconds');
    setItemInCache({expiry: new Date().getTime() + 15 * 1000}, true);
    nextDemo('cacheDataWithOptions', 'waiting');
    setTimeout(function () {
        nextDemo('waiting', 'getDataAfterExpiry');
    }, 15000);

}

function clearCache() {
    appworks.cache.clear();
    alert('cache cleared!');
    nextDemo('clearCache', 'openCamera');
}

function openCamera() {
    appworks.camera.takePicture(function (dataUrl) {
        var el = document.querySelector('body');
        el.setAttribute('style', 'background: url(' + dataUrl + ') no-repeat; background-size: cover;');
        
        nextDemo('openCamera', 'openGallery');
        
    }, function (err) {
        console.log(err)
    });
}

function openGallery() {
    appworks.camera.chooseFromLibrary(function (dataUrl) {
        var el = document.querySelector('body');
        el.setAttribute('style', 'background: url(' + dataUrl + ') no-repeat; background-size: cover;');
        
        nextDemo('openGallery', 'demoOver');
        
    }, function (err) {
        console.log(err)
    });
}

app.initialize();