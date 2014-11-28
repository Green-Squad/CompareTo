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
        tx.executeSql('CREATE TABLE IF NOT EXISTS objects (id INTEGER UNIQUE PRIMARY KEY, name TEXT)');
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
        tx.executeSql('INSERT INTO objects (id, name) VALUES (1, "Bird")');
        tx.executeSql('INSERT INTO objects (id, name) VALUES (2, "Plane")');
        tx.executeSql('INSERT INTO objects (id, name) VALUES (3, "Superman")');

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
    console.log("paeshow");
    $('#animation').find('.ui-content').html("");
    $('#animation').find('.ui-content').append("<p>Metric ID: " + gMetricID + "</p>");

    var speed = function() {

        var speedBase = 1500;
        var distance = '-' + $(window).height() * (3/4) + 'px';

        var animate = function(max, min) {

            $('#animation').find('.ui-content').append("<div class='box' id='left-object' style='left: " + parseInt($(window).width() / 4) + "px;'><p><i class=' fa fa-plane fa-4'></i> ID: " + max.id + " / Value: " + max.value + "</p></div>");
            $('#animation').find('.ui-content').append("<div class='box' id='right-object' style='right: " + parseInt($(window).width() / 4) + "px;'><p><i class=' fa fa-twitter fa-4'></i>ID: " + min.id + " / Value: " + min.value + "</p></div>");

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

    if (gMetricID == 1) {
        speed();
    } else if (gMetricID == 2) {
        weight();
    } else if (gMetricID == 3) {
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
    console.log("pagebeforehide");
    var getObject1Value = function(tx, res) {
        gObject1.value = res.rows.item(0).value;
        console.log("object1Value: " + gObject1.value)
    }

    var getObject2Value = function(tx, res) {
        gObject2.value = res.rows.item(0).value;
        console.log("object2Value: " + gObject2.value)
    }

    gMetricID = $('#comparison-type').val();
    gObject1.id = $('#object-1').val();
    gObject2.id = $('#object-2').val();

    var db = app.db;
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM metric_object WHERE object_id = ? AND metric_id = ?", [gObject1.id, gMetricID],
            getObject1Value,
            app.onError);
        tx.executeSql("SELECT * FROM metric_object WHERE object_id = ? AND metric_id = ?", [gObject2.id, gMetricID],
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

var gMetricID;

var gObject1 = {};
var gObject2 = {};
var gMetric = {};
