var map;
var polygons = {
    collection: {},
    selectedShape: null,
    add: function(e) {
        var shape = e.overlay,
            that = this;
        shape.type = e.type;
        shape.path = e.overlay.getPath();
        shape.id = new Date().getTime() + Math.floor(Math.random() * 1000);
        this.collection[shape.id] = shape;
        this.setSelection(shape);
        google.maps.event.addListener(shape,'click', function() {
            that.setSelection(this);
        });
        return shape.id;
    },
    hide: function(polygon) {
        polygon.setMap(null);
    },
    show: function(polygon) {
        polygon.setMap(map);
    },
    delete: function(polygon) {
        polygon.setMap(null);
        delete this.collection[polygon.id];
    },
    clearAll: function() {
        for (polygonID in this.collection) {
            managePolygon(polygonID, "delete");
            polygons.delete(polygons.collection[polygonID]);
        }
    },
    newPolygon: function(poly) {
        var shape = poly,
            that = this;
        shape.type = "polygon";
        shape.path = poly.path;
        shape.id = new Date().getTime() + Math.floor(Math.random() * 1000);
        this.collection[shape.id] = shape;
        this.setSelection(shape);
        google.maps.event.addListener(shape,'click', function() {
            that.setSelection(this);
        });
        shape.setMap(map);
        return shape.id;
    },
    setSelection: function(shape) {
        if(this.selectedShape !== shape) {
            this.clearSelection();
            this.selectedShape = shape;
            shape.set('editable', true);
        }
    },
    deleteSelected: function() {
        if(this.selectedShape) {
            var shape= this.selectedShape;
            this.clearSelection();
            shape.setMap(null);
            delete this.collection[shape.id];
        }
    },
    clearSelection: function() {
        if(this.selectedShape) {
            this.selectedShape.set('draggable', false);
            this.selectedShape.set('editable', false);
            this.selectedShape = null;
        }
    },
    save: function() {
        var collection = [];
        for (var k in this.collection) {
            var shape = this.collection[k],
            types = google.maps.drawing.OverlayType;
            switch(shape.type) {
                case types.POLYGON:
                    collection.push({
                        type:shape.type,
                        path:google.maps.geometry.encoding.encodePath(
                            shape.getPath())
                    });
                    break;
                default:
                    alert('implement a storage-method for ' + shape.type)
            }
        }
    },
    generateColor: function(e) {
        var colorVal = "#";
        for(var x = 0; x < 6; x++) {
            var randNum = Math.floor(Math.random() * 10) + 6;
            switch(randNum) {
                case 10:
                    colorVal += "A";
                    break;
                case 11:
                    colorVal += "B";
                    break;
                case 12:
                    colorVal += "C";
                    break;
                case 13:
                    colorVal += "D";
                    break;
                case 14:
                    colorVal += "E";
                    break;
                case 15:
                    colorVal += "F";
                    break;
                default:
                    colorVal += randNum.toString();
            }
        }
        return colorVal;
    }
};

function initialize() {
    var mapProp = {
        center: new google.maps.LatLng(38.7931,-89.9967),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapProp);
    var polyOptions = {
        fillColor : polygons.generateColor(),
        fillOpacity: .8,
        strokeWeight: 4,
        zIndex: 1
    };
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        },
        polygonOptions: polyOptions
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
        var polygonOptions = drawingManager.get('polygonOptions');
        polygonOptions.fillColor = polygons.generateColor();
        drawingManager.set('polygonOptions', polygonOptions);
        managePolygon(polygons.add(event), "add");
        $("#clear-regions").removeClass("hidden");
    });
    showEmptyRegionList();
    $('#find-intersections').click(function() {
        $.ajax({
            type: "POST",
            url: "/api/find_intersections",
            success: function(data) {
                if (data.success)
                    generateNewPolygon(data);
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $('#find-unions').click(function() {
        var polygonIDArray = [];
        for (var key in polygons.collection) {
            polygonIDArray.push(key);
        }
        data = JSON.stringify(polygonIDArray);
        $.ajax({
            type: "POST",
            url: "/api/find_unions",
            data: {polygonIDs:data},
            success: function(data) {
                console.log(data);
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $("#clear-regions").on("click", function(e) {
        polygons.clearAll();
        $("#region-list").empty();
        showEmptyRegionList();
        $("#clear-regions").addClass("hidden");
    });
}

function managePolygon(polygonID, action) {
    if (action === "add") {
        data = JSON.stringify(
            {
                "id": polygonID,
                "path": polygons.collection[polygonID].path.getArray(),
                "action": action
            }
        );
        addPolygonToList(polygonID);
    } else if (action === "delete") {
        data = JSON.stringify(
            {
               "id": polygonID,
               "action": action
            }
        );
    } else {
        data = JSON.stringify(
            {
               "id": polygonID,
               "action": action
            }
        );
    } 
    $.ajax({
        type: "POST",
        url: "/api/manage_region",
        data: {"data": data},
        success: function(data) {

        },
        failure: function(data) {
            console.log(data);
        }
    });
}

function addPolygonToList(polygonID) {
    var fillColor = polygons.collection[polygonID].fillColor;
    $("#placeholder-empty").remove();
    $("#region-list").append(
        $("<li>").attr("id", polygonID).attr("class", "list-group-item row")
            .attr("style", "margin: 1%; background-color: " + fillColor + ";")
            .append($("<p>").attr("style", "padding-bottom: 5%;").text("Region ID: " + polygonID))
            .append($("<button>").attr("id", "show-hide-" + polygonID).attr("class", "btn btn-default col-md-5 mobile-device").attr("style", "padding-bottom: 1%").text("Hide"))
            .append($("<div>").attr("class", "col-md-2"))
            .append($("<button>").attr("id", "delete-" + polygonID).attr("class", "btn btn-danger col-md-5 mobile-device").text("Delete"))
    );
    $("#show-hide-" + polygonID).on("click", function(e) {
        var polygonID = $(this).parent().attr("id");
        var polygon = polygons.collection[polygonID];
        if ($(this).text() === "Hide") {
            $(this).text("Show");
            polygons.hide(polygon);
        } else {
            $(this).text("Hide");
            polygons.show(polygon);
        }
        managePolygon(polygonID, "visible");
    })
    $("#delete-" + polygonID).on("click", function(e) {
        var polygonID = $(this).parent().attr("id");
        var polygon = polygons.collection[polygonID];
        managePolygon(polygonID, "delete");
        polygons.delete(polygon);
        $(this).parent().remove();
        console.log($("#region-list").children().length);
        if (!$("#region-list").children().length) {
            showEmptyRegionList();
            $("#clear-regions").addClass("hidden");
        }
    })
}

function clearSession() {
    $.ajax({
        type: "POST",
        url: "/api/clear_session",
        success: function(data) {
        },
        failure: function(data) {
            console.log(data);
        }
    });
}

function generateNewPolygon(polygon) {
    var arr = new Array();
    for (var i = 0; i < polygon.data.length; i++) {
        arr.push(new google.maps.LatLng(polygon.data[i].lat, polygon.data[i].lng));
    }
    var poly = new google.maps.Polygon({
        path: arr,
        strokeWeight: 4,
        fillColor: polygons.generateColor(),
        fillOpacity: 0.8,
        zIndex: 3
    });
    var polygonID = polygons.newPolygon(poly)
    addPolygonToList(polygonID);
    managePolygon(polygonID, "add");
}

function showEmptyRegionList() {
    $("#region-list").append(
        $("<li>").attr("id", "placeholder-empty").attr("class", "list-group-item").text(
            "No regions created. Draw on the map to create regions or import from a database.")
    );
}

$(document).ready(function() {
    initialize();
    clearSession();
});
