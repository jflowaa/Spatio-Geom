var map;
var polygons = {
    collection: {},
    add: function(e) {
        return polygons.newPolygon(e.overlay);
    },
    hide: function(polygon) {
        polygon.visible = false;
        if (polygon.selected) {
            clearPolygonSelectBorder(polygon.id);
            polygon.selected = false;
            managePolygon(polygon.id, "select");
        }
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
    newPolygon: function(poly, polyID, is3D, start, end) {
        if (polyID == null)
            polyID = 0;
        var shape = poly, that = this;
        shape.type = "polygon";
        shape.path = poly.getPaths();
        shape.id = polyID == 0 ? new Date().getTime() + Math.floor(Math.random() * 1000) : polyID;
        shape.selected = false;
        shape.visible = true;
        shape.is3DPolygon = is3D || false;
        if (is3D) {
            shape.startTime = start;
            shape.endTime = end;
            shape.interpolatedRegionID = 0;
        }
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
        var color = "#";
        for (var x = 0; x < 6; x++) {
            var randNum = Math.floor(Math.random() * (15 - 7) + 7);
            switch(randNum) {
                case 10:
                    color += "A";
                    break;
                case 11:
                    color += "B";
                    break;
                case 12:
                    color += "C";
                    break;
                case 13:
                    color += "D";
                    break;
                case 14:
                    color += "E";
                    break;
                case 15:
                    color += "F";
                    break;
                default:
                    color += randNum.toString();
            }
    }
    return color;
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
    $('#interpolate-regions').click(function() {
        var startTime = $("#start-time").val();
        var endTime = $("#end-time").val();
        data = JSON.stringify(
            {
                "startTime" : startTime,
                "endTime" : endTime
            }
        );
        $.ajax({
            type: "POST",
            url: "/api/find_interoplated_regions",
            data: {"data": data},
            success: function(data) {
                if (data.success) {
                    var restoreID = [];
                    for (var polygon in polygons.collection) {
                        if (polygons.collection[polygon].selected) {
                            var button = "#delete-" + polygon;
                            $(button).parent().remove();
                            if (!$("#region-list").children().length) {
                                showEmptyRegionList();
                                $("#clear-regions").addClass("hidden");
                            }
                            restoreID.push(polygon);
                            $("#custom-menu").addClass("hidden");
                            polygons.delete(polygons.collection[polygon]);
                        }
                    }
                    managePolygon(restoreID[0], "delete", null);
                    generateNewPolygon(data.data, "Interpolated Regions", restoreID[1], startTime, endTime);
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
                "computation": computation,
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
        var polygon = polygons.collection[polygonID];
        $("#region-list").append(
            $("<li>").attr("id", polygonID).attr("class", "list-group-item row")
                .attr("style", "margin: 1%; background-color: " + fillColor + ";")
                .append($("<h4>").attr("style", "padding-bottom: 5%;").text("Region ID: " + polygonID + compName))
                .append($("<input>").attr("type", "checkbox").attr("id", "checkbox-" + polygonID).attr("class", "ignore-click"))
                .append($("<label>").attr("for", "checkbox-" + polygonID).attr("class", "ignore-click").text(" Only create one region"))
                .append($("<input>").attr("type", "range").attr("id", "slider-" + polygonID).attr("class", "form-control ignore-click").attr("min", polygon.startTime).attr("max", polygon.endTime).attr("value", polygon.startTime))
                .append($("<button>").attr("id", "show-hide-" + polygonID).attr("class", "btn btn-default col-md-5 mobile-device ignore-click").attr("style", "padding-bottom: 1%").text("Hide"))
                .append($("<div>").attr("class", "col-md-2"))
                .append($("<button>").attr("id", "delete-" + polygonID).attr("class", "btn btn-danger col-md-5 mobile-device ignore-click").text("Delete"))
        );
        bindInterpolatedChange(polygonID, false);
        $("#checkbox-" + polygonID).click(function() {
            bindInterpolatedChange(polygonID, $(this).is(':checked'));
        });
    } else {
        $("#region-list").append(
            $("<li>").attr("id", polygonID).attr("class", "list-group-item row")
                .attr("style", "margin: 1%; background-color: " + fillColor + ";")
                .append($("<h4>").attr("style", "padding-bottom: 5%;").text("Region ID: " + polygonID + compName))
                .append($("<button>").attr("id", "show-hide-" + polygonID).attr("class", "btn btn-default col-md-5 mobile-device ignore-click").attr("style", "padding-bottom: 1%").text("Hide"))
                .append($("<div>").attr("class", "col-md-2"))
                .append($("<button>").attr("id", "delete-" + polygonID).attr("class", "btn btn-danger col-md-5 mobile-device ignore-click").text("Delete"))
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
        if (!$(e.target).hasClass("ignore-click"))
            handlePolygonSelect(polygonID);
   })
}

function bindInterpolatedChange(polygonID, checked) {
    $("#slider-" + polygonID).unbind();
    if (checked) {
        $("#slider-" + polygonID).on("input", function(e) {
            data = JSON.stringify(
                {
                    "time" : e.target.value,
                    "polygonID" : polygonID
                }
            );
            var polygon = polygons.collection[polygonID];
            if (polygon.interpolatedRegionID != 0) {
                var button = "#delete-" + polygon.interpolatedRegionID;
                $(button).parent().remove();
                if (!$("#region-list").children().length) {
                    showEmptyRegionList();
                    $("#clear-regions").addClass("hidden");
                }
                $("#custom-menu").addClass("hidden");
                polygons.delete(polygons.collection[polygon.interpolatedRegionID]);
            }
            $.ajax({
                type: "POST",
                url: "/api/find_region_at_time",
                polyID: polygonID,
                data: {"data": data},
                success: function(data) {
                    var id = generateNewPolygon(data.data, "From Interoplated");
                    managePolygon(polygons.collection[this.polyID].interpolatedRegionID, "delete", null);
                    polygons.collection[this.polyID].interpolatedRegionID = id;
                },
                failure: function(data) {
                    console.log(data);
                }
            });
        });
    } else {
        $("#slider-" + polygonID).unbind().change(function(e) {
            data = JSON.stringify(
                {
                    "time" : e.target.value,
                    "polygonID" : polygonID
                }
            );
            $.ajax({
                type: "POST",
                url: "/api/find_region_at_time",
                data: {"data": data},
                success: function(data) {
                    generateNewPolygon(data.data, "From Interoplated")
                },
                failure: function(data) {
                    console.log(data);
                }
            });
        });
    }
}

function handlePolygonSelect(polygonID) {
    if (polygons.collection[polygonID].visible) {
        polygons.collection[polygonID].selected = !polygons.collection[polygonID].selected;
        if (polygons.collection[polygonID].selected) {
            showPolygonSelectBorder(polygonID);
            polygons.collection[polygonID].setOptions({strokeWeight: 5});
        } else {
            clearPolygonSelectBorder(polygonID);
            polygons.collection[polygonID].setOptions({strokeWeight: 3});
        }
        managePolygon(polygonID, "select", null);
    }
}

function clearPolygonSelection() {
    for (polygonID in polygons.collection) {
        handlePolygonSelect(polygonID);
    }
}

function showPolygonSelectBorder(polygonID) {
    $("#" + polygonID).css({"border": "2px solid black"});
}

function clearPolygonSelectBorder(polygonID) {
    $("#" + polygonID).css({"border": "none"});
}

function deletePolygonButton(button, polygon) {
    for (var polygonID in polygons.collection) {
        if (polygons.collection[polygonID].interpolatedRegionID === polygon.id) {
            polygons.collection[polygonID].interpolatedRegionID = 0;
        }
    }
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
                    generateNewPolygon(data.data.polygons[i].coords,
                                       data.data.polygons[i].computation,
                                       data.data.polygons[i].id,
                                       data.data.polygons[i].visible);
                }
            }
        },
        failure: function(data) {
            console.log(data);
        }
    });
}

function generateNewPolygon(polygonCoords, computation, restoreID, startTime, endTime) {
    /**
     * Creates a polygon from the given coords. polygonCoords is an object with
     * arrays. The arrays are paths to take. Think of this as sides of a shape.
     * restoreID is used for restoring a polygon, if it is set, not 0, then the
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
    var polygonID = 0;
    if (restoreID) {
        var is3d = computation === "Interpolated Regions" ? true : false;
        polygonID = polygons.newPolygon(poly, restoreID, is3d, startTime, endTime);
        addPolygonToList(polygonID, computation);
    } else {
        polygonID = polygons.newPolygon(poly);
        managePolygon(polygonID, "add", computation);
    }
    return polygonID;
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
