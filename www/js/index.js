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
        tx.executeSql('CREATE TABLE IF NOT EXISTS objects (id INTEGER UNIQUE PRIMARY KEY, name TEXT, icon TEXT, color TEXT)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS metric_object (metric_id INTEGER, object_id INTEGER, value INTEGER, FOREIGN KEY (metric_id) REFERENCES Metrics (id), FOREIGN KEY (object_id) REFERENCES Objects (id))');
    });
}

app.seedTables = function() {
    var db = app.db;
    db.transaction(function(tx) {
        // Seeding metrics
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (1, "Speed")');
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (2, "Weight")');
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (3, "Height")');

        // Seeding objects
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (1, "Bird", "twitter", "blue")');
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (2, "Plane", "plane", "grey")');
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (3, "Superman", "male", "red")');

        // Seeding metric_object
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (1, 1, 10)');      // Metric 1 = Speed, Object 1 = Bird
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (1, 2, 50)');      // Metric 1 = Speed, Object 2 = Plane
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (2, 1, 100)');     // Metric 2 = Weight, Object 1 = Bird
});
}

app.onSuccess = function(tx, r) {
    console.log("success");
    app.refresh();
}

app.onError = function(tx, e) {
    console.log("Error: " + e.message);
}

app.loadMetrics = function() {
    var addMetrics = function (row) {
        var option = document.createElement("option");
        option.text = row.name;
        option.value = row.id;
        metricItems.add(option);
    }

    var renderMetrics = function (tx, res) {
        for (var i = 0; i < res.rows.length; i++) {
            addMetrics(res.rows.item(i));
        }
    }

    var metricItems = document.getElementById("comparison-type");
    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM metrics", [],
            renderMetrics,
            app.onError);
    });
}

app.loadObjects = function() {

    var addObjects = function(row) {
        var option1 = document.createElement("option");
        option1.text = row.name; 
        option1.value = row.object_id;

        document.getElementById("object-1").add(option1);

        var option2 = document.createElement("option");
        option2.text = row.name;
        option2.value = row.object_id;

        document.getElementById("object-2").add(option2);
    }

    var renderObjects = function(tx, res) {
        for (var i = 0; i < res.rows.length; i++) {
            console.log(res.rows.item(i));
            addObjects(res.rows.item(i));
        }
    }

    var metricID = $('#comparison-type').val();

    document.getElementById("object-1").innerHTML = "<option value='' disabled>Choose an object to compare</option>";
    document.getElementById("object-2").innerHTML = "<option value='' disabled>Choose an object to compare</option>";
    $("#object-1-button").find('span').text("Choose an object to compare");
    $("#object-2-button").find('span').text("Choose an object to compare");

    if ($('#objects-container').hasClass('hidden')) {
        $('#objects-container').show();
    }

    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM metric_object JOIN objects ON objects.id = metric_object.object_id WHERE metric_id = ?", [metricID],
            renderObjects,
            app.onError);
    });
}

// Only shows the submit button if both object selects have a selected option
app.loadSubmit = function () {
    if ($('#object-1').val() == null || $('#object-2').val() == null) {
        $('#submit-button-container').hide();
    } else {
        $('#submit-button-container').show();
    }
}

app.showAnimation = function () {
    $('#animation').find('.ui-content').html("");
    $('#animation').find('.ui-content').append("<div class=""><h1>" + gMetric.name + "</h1></div>");

    var speed = function() {

        var speedBase = 1500;
        var distance = '-' + $(window).height() * (3/5) + 'px';

        var animate = function(max, min) {

            $('#animation').find('.ui-content').append("<div class='box' id='left-object' style='left: " + parseInt($(window).width() / 6) + "px;'><p><i class=' fa fa-" +
max.icon + " fa-4 " + max.color +"'></i></p><p>" + max.name + "</p><p>" + max.value + " mph</p></div>");
            $('#animation').find('.ui-content').append("<div class='box' id='right-object' style='right: " + parseInt($(window).width() / 6) + "px;'><p><i class=' fa fa-" + min.icon + " fa-4 " + min.color +"'></i></p><p>" + min.name + "</p><p>" + min.value + " mph</p></div>");

            var valRatio = max.value / min.value;
            var slowSpeed = speedBase * valRatio;

            $('#left-object').transition({
                y: distance,
                easing: 'linear',
                duration: speedBase
            });
            $('#right-object').transition({
                y: distance,
                easing: 'linear',
                duration: slowSpeed
            });
        }

        if (gObject1.value >= gObject2.value) {
            animate(gObject1, gObject2)
        } else {
            animate(gObject2, gObject1)
        }



    }

    var weight = function () {

    }

    var height = function () {

    }

    if (gMetric.id == 1) {
        speed();
    } else if (gMetric.id == 2) {
        weight();
    } else if (gMetric.id == 3) {
        height();
    }
}

function init() {
    app.openDb();
    app.createTables();
    app.seedTables();
    app.loadMetrics();
}

$("#comparison-type").change(function() {
    app.loadObjects();
});

$("select").change(function () {
    app.loadSubmit();
});

$(document).on('pagebeforehide', '#home', function(e, data){
    var getObject1Value = function(tx, res) {
        gObject1.value = res.rows.item(0).value;
        gObject1.icon = res.rows.item(0).icon;
        gObject1.color = res.rows.item(0).color;
        gObject1.name = res.rows.item(0).name;
    }

    var getObject2Value = function(tx, res) {
        gObject2.value = res.rows.item(0).value;
        gObject2.icon = res.rows.item(0).icon;
        gObject2.color = res.rows.item(0).color;
        gObject2.name = res.rows.item(0).name;
    }

    gMetric.id = $('#comparison-type').val();
    gMetric.name = $('#comparison-type').text();
    gObject1.id = $('#object-1').val();
    gObject2.id = $('#object-2').val();

    var db = app.db;
    var query = "SELECT * FROM metric_object JOIN objects ON objects.id = metric_object.object_id WHERE object_id = ? AND metric_id = ?";
    db.transaction(function(tx) {
        tx.executeSql(query, [gObject1.id, gMetric.id],
            getObject1Value,
            app.onError);
        tx.executeSql(query, [gObject2.id, gMetric.id],
            getObject2Value,
            app.onError);
    });

    $('#animation').find('.ui-content').html("");
});

// pageshow event comes after pagebeforehide, so the variables have values
$(document).on('pageshow', '#animation', function(e, data) {
    app.showAnimation();
});

$(window).on("orientationchange", function(event) {
    if ($.mobile.activePage.attr("id") == "animation") {
        window.onresize = function() {
            app.showAnimation();
        }
    }
});


var gObject1 = {};
var gObject2 = {};
var gMetric = {};
