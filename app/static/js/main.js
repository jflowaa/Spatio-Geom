var map;
var polygons = {
    collection: {},
    is3DPolygon: false,
    add: function(e) {
        var shape = e.overlay,
            that = this;
        shape.type = e.type;
        shape.path = e.overlay.getPaths();
        shape.id = new Date().getTime() + Math.floor(Math.random() * 1000);
        shape.selected = false;
        shape.visible = true;
        this.collection[shape.id] = shape;
        google.maps.event.addListener(shape,'click', function() {
            handlePolygonSelect(shape.id);
        });
        google.maps.event.addListener(shape, 'rightclick', function(event) {
            handleContextMenu(event, this);
        });
        shape.setMap(map);
        return shape.id;
    },
    hide: function(polygon) {
        polygon.visible = false;
        polygon.setMap(null);
    },
    show: function(polygon) {
        polygon.visible = true;
        polygon.setMap(map);
    },
    delete: function(polygon) {
        polygon.setMap(null);
        delete this.collection[polygon.id];
    },
    clearAll: function() {
        for (polygonID in this.collection) {
            managePolygon(polygonID, "delete", null);
            polygons.delete(polygons.collection[polygonID]);
        }
        clearSession();
    },
    newPolygon: function(poly) {
        var shape = poly,
            that = this;
        shape.type = "polygon";
        shape.path = poly.getPaths();
        shape.id = new Date().getTime() + Math.floor(Math.random() * 1000);
        shape.selected = false;
        shape.visible = true;
        this.collection[shape.id] = shape;
        google.maps.event.addListener(shape,'click', function() {
            handlePolygonSelect(shape.id);
        });
        google.maps.event.addListener(shape, 'rightclick', function(event) {
            handleContextMenu(event, this);
        });
        shape.setMap(map);
        return shape.id;
    },
    restorePolygon: function(poly, polyId) {
        var shape = poly,
            that = this;
        shape.type = "polygon";
        shape.path = poly.getPaths();
        shape.id = polyId;
        shape.selected = false;
        shape.visible = true;
        this.collection[shape.id] = shape;
        google.maps.event.addListener(shape,'click', function() {
            handlePolygonSelect(shape.id);
        });
        google.maps.event.addListener(shape, 'rightclick', function(event) {
            handleContextMenu(event, this);
        });
        shape.setMap(map);
        return shape.id;
    },
    generateColor: function(e) {
        var colorVal = "#";
        for (var x = 0; x < 6; x++) {
            var randNum = Math.floor(Math.random() * (13 - 1) + 1);
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
        strokeWeight: 3,
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
        managePolygon(polygons.add(event), "add", null);
    });
    showEmptyRegionList();
    $('#find-intersections').click(function() {
        $.ajax({
            type: "POST",
            url: "/api/find_intersections",
            success: function(data) {
                if (data.success) {
                    generateNewPolygon(data.data, "Intersection");
                    clearPolygonSelection();
                }
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $('#find-unions').click(function() {
        $.ajax({
            type: "POST",
            url: "/api/find_unions",
            success: function(data) {
                if (data.success) {
                    generateNewPolygon(data.data, "Union");
                    clearPolygonSelection();
                }
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $('#find-differences').click(function() {
        $.ajax({
            type: "POST",
            url: "/api/find_difference",
            success: function(data) {
                if (data.success) {
                    generateNewPolygon(data.data, "Difference");
                    clearPolygonSelection()
                }
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

function managePolygon(polygonID, action, computation) {
    var paths = new Array();
    if (action === "add") {
        for (var singlePath in polygons.collection[polygonID].path.getArray()) {
            paths.push(polygons.collection[polygonID].path.getArray()[singlePath].getArray());
        }
        data = JSON.stringify(
            {
                "id": polygonID,
                "path": paths,
                "action": action
            }
        );
        addPolygonToList(polygonID, computation);
    } else if (action === "delete") {
        data = JSON.stringify(
            {
               "id": polygonID,
               "action": action
            }
        );
    } else if (action === "select") {
        data = JSON.stringify(
            {
               "id": polygonID,
               "action": action
            }
        );
    } else {
        // This shouldn't happen
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
            // Nothing needs to be done client side
        },
        failure: function(data) {
            console.log(data);
        }
    });
}

function addPolygonToList(polygonID, computation) {
    /**
    *   Removes the empty list placeholder.
    *   Creates the card item for the region list tab. If the region is a 3D
    *   region then it will have a slider.
    *   Binds click events to the buttons found on the card item.
    **/
    var fillColor = polygons.collection[polygonID].fillColor;
    var compName = "";
    if (computation) {
        compName = " (" + computation + ")";
    }
    $("#placeholder-empty").remove();
    if(polygons.collection[polygonID].is3DPolygon === true) {
        $("#region-list").append(
            $("<li>").attr("id", polygonID).attr("class", "list-group-item row")
                .attr("style", "margin: 1%; background-color: " + fillColor + ";")
                .append($("<h4>").attr("style", "padding-bottom: 5%;").text("Region ID: " + polygonID + compName))
                .append($("<input>").attr("type", "range").attr("class", "form-control"))
                .append($("<button>").attr("id", "show-hide-" + polygonID).attr("class", "btn btn-default col-md-5 mobile-device").attr("style", "padding-bottom: 1%").text("Hide"))
                .append($("<div>").attr("class", "col-md-2"))
                .append($("<button>").attr("id", "delete-" + polygonID).attr("class", "btn btn-danger col-md-5 mobile-device").text("Delete"))
        );
    } else {
        $("#region-list").append(
            $("<li>").attr("id", polygonID).attr("class", "list-group-item row")
                .attr("style", "margin: 1%; background-color: " + fillColor + ";")
                .append($("<h4>").attr("style", "padding-bottom: 5%;").text("Region ID: " + polygonID + compName))
                .append($("<button>").attr("id", "show-hide-" + polygonID).attr("class", "btn btn-default col-md-5 mobile-device").attr("style", "padding-bottom: 1%").text("Hide"))
                .append($("<div>").attr("class", "col-md-2"))
                .append($("<button>").attr("id", "delete-" + polygonID).attr("class", "btn btn-danger col-md-5 mobile-device").text("Delete"))
        );
    }
    $("#show-hide-" + polygonID).on("click", function(e) {
        var polygon = polygons.collection[polygonID];
        showHidePolygonButton(this, polygon);
    })
    $("#delete-" + polygonID).on("click", function(e) {
        var polygonID = $(this).parent().attr("id");
        var polygon = polygons.collection[polygonID];
        deletePolygonButton(this, polygon);
    })
    $("#clear-regions").removeClass("hidden");
    $("#" + polygonID).on("click", function(e) {
        if (!$(e.target).hasClass("btn"))
            handlePolygonSelect(polygonID);
   })
}

function handlePolygonSelect(polygonID) {
    if (polygons.collection[polygonID].visible) {
        polygons.collection[polygonID].selected = !polygons.collection[polygonID].selected
        if (polygons.collection[polygonID].selected) {
            showPolygonSelectBoarder(polygonID);
            polygons.collection[polygonID].setOptions({strokeWeight: 5});
        } else {
            clearPolygonSelectBoarder(polygonID);
            polygons.collection[polygonID].setOptions({strokeWeight: 3});
        }
        managePolygon(polygonID, "select");
    }
}

function clearPolygonSelection() {
    for (polygonID in polygons.collection) {
        handlePolygonSelect(polygonID);
    }
}

function showPolygonSelectBoarder(polygonID) {
    $("#" + polygonID).css({"border": "2px solid black"});
}

function clearPolygonSelectBoarder(polygonID) {
    $("#" + polygonID).css({"border": "none"});
}

function deletePolygonButton(button, polygon) {
    managePolygon(polygon.id, "delete");
    polygons.delete(polygon);
    $(button).parent().remove();
    if (!$("#region-list").children().length) {
        showEmptyRegionList();
        $("#clear-regions").addClass("hidden");
    }
}

function showHidePolygonButton(button, polygon) {
    if ($(button).text() === "Hide") {
        $(button).text("Show");
        polygons.hide(polygon);
    } else {
        $(button).text("Hide");
        polygons.show(polygon);
    }
    clearPolygonListBorders(polygon.id);
    managePolygon(polygon.id, "visible");
}

function deletePolygonButton(button, polygon) {
    managePolygon(polygon.id, "delete");
    polygons.delete(polygon);
    $(button).parent().remove();
    if (!$("#region-list").children().length) {
        showEmptyRegionList();
        $("#clear-regions").addClass("hidden");
    }
}

function showHidePolygonButton(button, polygon) {
    if ($(button).text() === "Hide") {
        $(button).text("Show");
        polygons.hide(polygon);
    } else {
        $(button).text("Hide");
        polygons.show(polygon);
    }
    managePolygon(polygon.id, "visible");
}

function restoreSession() {
    $.ajax({
        type: "POST",
        url: "/api/restore_session",
        success: function(data) {
            if (data.success) {
                // Doing a for instead of a foreach because foreach was giving
                // the index instead of the object. No idea
                for (i = 0; i < data.data.polygons.length; i++) {
                    generateNewPolygon(data.data.polygons[i].coords, "", data.data.polygons[i].id,
                                       data.data.polygons[i].visible);
                }
            }
        },
        failure: function(data) {
            console.log(data);
        }
    });
}

function generateNewPolygon(polygonCoords, computation, restoreId=0, isVisible=true) {
    /**
     * Creates a polygon from the given coords. polygonCoords is an object with
     * arrays. The arrays are paths to take. Think of this as sides of a shape.
     * restoreId is used for restoring a polygon, if it is set, not 0, then the
     * new polygon isn't new, it is already in the session and we know an ID to
     * give it. This avoids duplicate regions in session.
     */
    var allPolygons = new Array();
    for (var polygon in polygonCoords) {
        var arr = new Array();
        for (var i = 0; i < polygonCoords[polygon].length; i++) {
            arr.push(new google.maps.LatLng(polygonCoords[polygon][i].lat, polygonCoords[polygon][i].lng));
        }
        allPolygons.push(arr);
    }
    var poly = new google.maps.Polygon({
        paths: allPolygons,
        strokeWeight: 3,
        fillColor: polygons.generateColor(),
        fillOpacity: 0.8,
        zIndex: 3
    });
    if (restoreId) {
        polygons.restorePolygon(poly, restoreId);
        addPolygonToList(restoreId, computation);
    } else {
        var polygonID = polygons.newPolygon(poly)
        managePolygon(polygonID, "add", computation);
    }
    if (!isVisible){
        $("#show-hide-" + poly.id).text("Show");
        polygons.hide(poly);
    }
}

function showEmptyRegionList() {
    $("#region-list").append(
        $("<li>").attr("id", "placeholder-empty").attr("class", "list-group-item").text(
            "No regions created. Draw on the map to create regions or import from a database.")
    );
}

function handleContextMenu(event, polygon) {
    // Show contextmenu
    $("#custom-menu").finish().toggle(100).css({
        top: event.eb.pageY + "px",
        left: event.eb.pageX + "px"
    });
    $("#custom-menu").removeClass("hidden");
    // If the menu element is clicked
    $("#custom-menu div").unbind().click(function(e) {
        // This is the triggered action name
        switch($(this).attr("data-action")) {
            case "hide": {
                var button = "#show-hide-" + polygon.id;
                showHidePolygonButton(button, polygon);
                $("#custom-menu").addClass("hidden");
                break;
            }
            case "delete": {
                var button = "#delete-" + polygon.id;
                deletePolygonButton(button, polygon);
                $("#custom-menu").addClass("hidden");
                break;
            }
            case "close": {
                $("#custom-menu").addClass("hidden");
                break;
            }
        }
      });
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

$(document).ready(function() {
    initialize();
    restoreSession();
    $(document).on("click", function(e) {
        var target = $(e.target);
        if (!$("#custom-menu").hasClass("hidden")) {
            if (!(target.is("h4") || target.is("#custom-menu")))
                $("#custom-menu").addClass("hidden");
        }
    });
});
