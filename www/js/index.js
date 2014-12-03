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
        tx.executeSql('INSERT INTO metrics (id, name) VALUES (3, "Size")');

        // Seeding objects
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (1, "Bald Eagle", "twitter", "black")');
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (2, "Boeing 747", "plane", "grey")');
        tx.executeSql('INSERT INTO objects (id, name, icon, color) VALUES (3, "Superman", "male", "red")');

        // Seeding metric_object speed
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (1, 1, 99)');         // Metric 1 = Speed, Object 1 = Bald Eagle
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (1, 2, 614)');        // Metric 1 = Speed, Object 2 = Boeing 747
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (1, 3, 670616629)');  // Metric 1 = Speed, Object 3 = Superman

        // Seeding metric_object weight
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (2, 1, 13)');         // Metric 2 = Weight, Object 1 = Bald Eagle
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (2, 2, 892450)');     // Metric 2 = Weight, Object 2 = Boeing 747
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (2, 3, 235)');        // Metric 2 = Weight, Object 3 = Superman

        // Seeding metric_object size
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (3, 1, 7.08)');       // Metric 2 = Size, Object 1 = Bald Eagle
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (3, 2, 231.1)');      // Metric 2 = Size, Object 2 = Boeing 747
        tx.executeSql('INSERT INTO metric_object (metric_id, object_id, value) VALUES (3, 3, 6.25)');       // Metric 2 = Size, Object 2 = Superman
});
}

app.onSuccess = function(tx, r) {
    console.log("success");
}

app.onError = function(tx, e) {
    console.log("Error: " + e.message);
}

app.loadMetrics = function() {
    console.log("load metrics");
    var addMetrics = function (row) {
        var option = document.createElement("option");
        option.text = row.name;
        option.value = row.id;
        metricItems.add(option);
        $('#comparison-type').val("-1");
    }

    var renderMetrics = function (tx, res) {
        for (var i = 0; i < res.rows.length; i++) {
            addMetrics(res.rows.item(i));
        }
    }
    $("#comparison-type-button").find('span').text("Choose a metric");
    var metricItems = document.getElementById("comparison-type");
    metricItems.innerHTML = "";
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

        $('#object-1').val("-1");
        $('#object-2').val("-1");
    }

    var renderObjects = function(tx, res) {
        for (var i = 0; i < res.rows.length; i++) {
            console.log(res.rows.item(i));
            addObjects(res.rows.item(i));
        }
    }

    var metricID = $('#comparison-type').val();
    $('#object-1').html("");
    $('#object-2').html("");

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
    $('#animation').find('.ui-content').append("<div class='center'><h1>" + gMetric.name + "</h1></div>");

    var speed = function() {

        var speedSlow = 5000;
        var distance = '-' + ($(window).height() - 200) + 'px';

        var animate = function(max, min) {

            $('#animation').find('.ui-content').append("<div class='speed-object' id='left-object' style='left: " + parseInt($(window).width() / 6) + "px;'><p><i class='fa fa-" +
max.icon + " fa-4' style='color:" + max.color + "'></i></p><p>" + max.name + "</p><p>" + max.value + " mph</p></div>");
            $('#animation').find('.ui-content').append("<div class='speed-object' id='right-object' style='right: " + parseInt($(window).width() / 6) + "px;'><p><i class='fa fa-" + min.icon + " fa-4' style='color:" + min.color + "'></i></p><p>" + min.name + "</p><p>" + min.value + " mph</p></div>");

            playAudio('speed');

            var valRatio = min.value / max.value;
            var speedFast = speedSlow * valRatio;

            $('#left-object').transition({
                y: distance,
                easing: 'cubic-bezier(.24,.01,.47,1)',
                duration: speedFast
            });
            $('#right-object').transition({
                y: distance,
                easing: 'cubic-bezier(.24,.01,.47,1)',
                duration: speedSlow
            });
        }

        if (gObject1.value >= gObject2.value) {
            animate(gObject1, gObject2)
        } else {
            animate(gObject2, gObject1)
        }

    }

    var weight = function () {

        var animate = function(max, min) {

            var valRatio = min.value / max.value;
            var degress = 0;

            if(valRatio == 1) {
                degrees = 0;
            } else if (valRatio <= 0.25) {
                degrees = 60;
            } else if (valRatio <= 0.50) {
                degrees = 40;
            } else if (valRatio <= 0.75) {
                degrees = 20;
            } else {
                degrees = 5;
            }

            $('#animation').find('.ui-content').append("<div class='weight-bar'></div>");
            $('#animation').find('.weight-bar').append("<div class='weight-object' id='left-object'><p><i id='left-icon' class='fa-4 fa fa-" + max.icon + "' style='color:" + max.color + "'></i></p><p>" + max.name + "</p><p>" + max.value + " lbs</p></div>");
            $('#animation').find('.weight-bar').append("<div class='weight-object' id='right-object'><p><i id='right-icon' class='fa-4 fa fa-" + min.icon +"' style='color:" + min.color + "'></i></p><p>" + min.name + "</p><p>" + min.value + " lbs</p></div>");

            playAudio('weight');

            var count = 0;
            var seesaw = setInterval(function(){
                if(count < 2) {
                    $(".weight-bar").transition({ rotate: degrees + 'deg' }, 1000, 'cubic-bezier(.43,0,.45,1)');
                    setTimeout(function(){
                        $(".weight-bar").transition({ rotate: '-' + degrees + 'deg' }, 1000, 'cubic-bezier(.43,0,.45,1)');
                    }, 100);
                } else {
                    clearInterval(seesaw);
                }
                count++;
            }, 200);
        }

        if (gObject1.value >= gObject2.value) {
            animate(gObject1, gObject2)
        } else {
            animate(gObject2, gObject1)
        }
    }

    var size = function () {

        var animate = function(max, min) {

            var valRatio = min.value / max.value;
            var sizeLarge = $(window).width()/3;
            var sizeSmall = sizeLarge * valRatio;

            if (sizeSmall < 1) {
                sizeSmall = 1;
            }

            $('#animation').find('.ui-content').append("<div class='size-object' id='left-object' style='left: " + parseInt($(window).width() / 6) + "px;'><p><i id='left-icon' class='fa fa-" + min.icon + " " + min.color + "' style='font-size: " + parseInt(sizeSmall) + "px'></i></p><p>" + min.name + "</p><p>" + min.value + " ft</p></div>");
            $('#animation').find('.ui-content').append("<div class='size-object' id='right-object' style='right: " + parseInt($(window).width() / 6) + "px;'><p><i id='right-icon' class='fa fa-" + max.icon + " " + max.color + "' style='font-size: " + parseInt(sizeLarge) + "px'></i></p><p>" + max.name + "</p><p>" + max.value + " ft</p></div>");

            playAudio('size');

            // zoom transition is initially set to 0 ms
            zoom.to({
                element: document.querySelector( 'i#left-icon' )
            });

            // zoom transition is set to 1500 ms to show the zoom out animation
            var TRANSITION_DURATION;
            setTimeout(function() {
                TRANSITION_DURATION = 1500;
                document.body.style.transition = 'transform '+ TRANSITION_DURATION +'ms ease';
                document.body.style.OTransition = '-o-transform '+ TRANSITION_DURATION +'ms ease';
                document.body.style.msTransition = '-ms-transform '+ TRANSITION_DURATION +'ms ease';
                document.body.style.MozTransition = '-moz-transform '+ TRANSITION_DURATION +'ms ease';
                document.body.style.WebkitTransition = '-webkit-transform '+ TRANSITION_DURATION +'ms ease';
                zoom.out();
            }, 1500);

            // zoom transition is reset to 0 for next time the animation is run
            TRANSITION_DURATION = 0;
            document.body.style.transition = 'transform '+ TRANSITION_DURATION +'ms ease';
            document.body.style.OTransition = '-o-transform '+ TRANSITION_DURATION +'ms ease';
            document.body.style.msTransition = '-ms-transform '+ TRANSITION_DURATION +'ms ease';
            document.body.style.MozTransition = '-moz-transform '+ TRANSITION_DURATION +'ms ease';
            document.body.style.WebkitTransition = '-webkit-transform '+ TRANSITION_DURATION +'ms ease';
        }

        if (gObject1.value >= gObject2.value) {
            animate(gObject1, gObject2)
        } else {
            animate(gObject2, gObject1)
        }
    }

    if (gMetric.id == 1) {
        speed();
    } else if (gMetric.id == 2) {
        weight();
    } else if (gMetric.id == 3) {
        size();
    }
}

function init() {
    app.openDb();
    app.createTables();
    //app.seedTables();
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
    gMetric.name = $('#comparison-type option:selected').text();
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

function getAppPath() {
    var path = window.location.pathname;
    path = path.substr( path, path.length - 10 );
    return 'file://' + path;
}

function playAudio(audioName) {
    // WP8 Device Platform = Win32NT
    if(device.platform == 'Android') {
        mediaPlayer = new Media(getAppPath() + "audio/" + audioName + ".mp3",
            function onSuccess() {
                mediaPlayer.release();
            },
            function onError(e){
                alert("error playing sound: " + JSON.stringify(e));
            }
        );
        mediaPlayer.play();
    }
}

function stopAudio() {
    if(mediaPlayer != '') {
        mediaPlayer.stop();
    }
}

$(document).on('pagebeforehide', '#animation', function(e, data){
    stopAudio();
});

$('#update-button').on('click', function(event) {

    var complete = function() {
        updatingDatabase = false;
        $('#loading').remove();
        console.log( "complete" );
        completeCount++;

        if (completeCount == 3) {
            var alertMsg = '';
            if (successCount == 3) {
                alertMsg = 'Successfully updated database.';
                if(device.platform == 'Android') {
                    navigator.notification.alert(alertMsg);
                }   else {
                    alert(alertMsg);
                }
            } else {
                alertMsg = 'There was an error updating the database. Please try again.';
                if(device.platform == 'Android') {
                    navigator.notification.alert('alertMsg');
                } else {
                    alert(alertMsg);
                }
            }

            app.loadMetrics();

        }
    };
    if (!updatingDatabase) {
        updatingDatabase = true;
        window.sqlitePlugin.deleteDatabase("compareto.db");
        app.db = window.sqlitePlugin.openDatabase({name: "compareto.db"});
        var db = app.db;
        db.transaction(function (tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS metrics (id INTEGER UNIQUE PRIMARY KEY, name TEXT)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS objects (id INTEGER UNIQUE PRIMARY KEY, name TEXT, icon TEXT, color TEXT)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS metric_object (metric_id INTEGER, object_id INTEGER, value INTEGER, FOREIGN KEY (metric_id) REFERENCES Metrics (id), FOREIGN KEY (object_id) REFERENCES Objects (id))');
        });

        var successCount = 0;
        var errorCount = 0;
        var completeCount = 0;

        $('#panel').find('.ui-content').append("<div class='center' id='loading'><img src='img/loading.gif' alt='Loading'><p>Updating database. Please wait.</p></div>");

        // metrics json
        $.getJSON("https://guarded-reef-6440.herokuapp.com/metrics.json", function (data) {
            db.transaction(function (tx) {
                for (var i = 0; i < data.length; i++) {
                    var query = 'INSERT INTO metrics (id, name) VALUES (' + data[i].id + ', "' + data[i].name + '")';
                    console.log(query);
                    tx.executeSql(query);
                }
            });
        }).done(function () {
            console.log("success");
            successCount++;
        }).fail(function () {
            console.log("error");
            errorCount++;
        }).always(complete);

        // objects json
        $.getJSON("https://guarded-reef-6440.herokuapp.com/comparison_objects.json", function (data) {
            db.transaction(function (tx) {
                for (var i = 0; i < data.length; i++) {
                    var query = 'INSERT INTO objects (id, name, icon, color) VALUES (' + data[i].id + ', "' + data[i].name + '", "' + data[i].icon + '", "' + data[i].color + '")';
                    console.log(query);
                    tx.executeSql(query);
                }
            });
        }).done(function () {
            console.log("success");
            successCount++;
        }).fail(function () {
            console.log("error");
            errorCount++;
        }).always(complete);

        // metric_objects json
        $.getJSON("https://guarded-reef-6440.herokuapp.com/metric_objects.json", function (data) {
            db.transaction(function (tx) {
                for (var i = 0; i < data.length; i++) {
                    var query = 'INSERT INTO metric_object (metric_id, object_id, value) VALUES (' + data[i].metric_id + ', ' + data[i].comparison_object_id + ', ' + data[i].value + ')';
                    console.log(query);
                    tx.executeSql(query);
                }
            });
        }).done(function () {
            console.log("success");
            successCount++;
        }).fail(function () {
            console.log("error");
            errorCount++;
        }).always(complete);
    } else {
        var alertMsg = 'Already updating database';
        if(device.platform == 'Android') {
            navigator.notification.alert(alertMsg);
        }   else {
            alert(alertMsg);
        }
    }

})

var mediaPlayer = '';
var gObject1 = {};
var gObject2 = {};
var gMetric = {};
var updatingDatabase = false;