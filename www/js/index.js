// Structure from https://github.com/Icenium/sample-sqlite/blob/master/sample-sqlite/scripts/main.js

document.addEventListener("deviceready", init, false);
//Activate :active state on device
document.addEventListener("touchstart", function() {}, false);

var app = {};
app.db = null;

app.openDb = function() {
        app.db = window.sqlitePlugin.openDatabase({name: "compareto.db"});
}

app.createTables = function() {
    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS metrics (id INTEGER UNIQUE PRIMARY KEY, name TEXT)');
    });
}

app.seedTables = function() {
    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (1, "Speed")');
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (2, "Weight")');
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (3, "Smell")');
    });
}

app.onSuccess = function(tx, r) {
    console.log("success");
    app.refresh();
}

app.onError = function(tx, e) {
    console.log("Error: " + e.message);
}

app.refresh = function() {
    var renderMetricsHTML = function (row) {
        return "<option value='" + row.name + "'>" + row.name + "</option>";
    }

    var renderMetrics = function (tx, rs) {
        var rowOutput = "";
        var metricItems = document.getElementById("comparison-type");
        for (var i = 0; i < rs.rows.length; i++) {
            rowOutput += renderMetricsHTML(rs.rows.item(i));
        }
        metricItems.innerHTML = rowOutput;
    }

    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM metrics", [],
            renderMetrics,
            app.onError);
    });
}

function init() {
    app.openDb();
    app.createTables();
    app.seedTables();
    app.refresh();
}