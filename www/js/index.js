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
        var db = window.sqlitePlugin.openDatabase({
            name: "compareto.db"
        });
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS metrics (id INTEGER UNIQUE PRIMARY KEY, name TEXT)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS objects (id INTEGER UNIQUE PRIMARY KEY, name TEXT)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS metric_object (id INTEGER UNIQUE PRIMARY KEY, metric_id INTEGER, object_id INTEGER, value INTEGER, FOREIGN KEY (metric_id) REFERENCES Metrics (id)), FOREIGN KEY (object_id) REFERENCES Objects (id))');
            tx.executeSql('INSERT INTO metrics (id, name) VALUES (1, "Speed")');
            tx.executeSql('INSERT INTO metrics (id, name) VALUES (2, "Weight")');
            tx.executeSql('INSERT INTO metrics (id, name) VALUES (3, "Smell")');


            tx.executeSql("SELECT * FROM metrics;", [], function(tx, res) {
                for (i = 0; i < res.rows.length; i++) {
                    console.log(res.rows.item(i))
                }
            });
        });
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

app.initialize();