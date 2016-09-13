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
        google.maps.event.addListener(shape,'click',function() {
            that.setSelection(this);
        });
    },
    setSelection: function(shape) {
        if(this.selectedShape !== shape) {
            this.clearSelection();
            this.selectedShape = shape;
            shape.set('draggable',true);
            shape.set('editable',true);
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
            this.selectedShape.set('draggable',false);
            this.selectedShape.set('editable',false);
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
    }
};
function initialize() {
    var mapProp = {
        center: new google.maps.LatLng(38.7931,-89.9967),
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapProp);
    var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
        },
        markerOptions: {icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'},
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: false,
            zIndex: 1
        }
    });
    drawingManager.setMap(map);
    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
        polygons.add(event);
    });
    $('#find-intersections').click(function() {
        var polygonIDArray = [];
        for (var polygon_id in polygons.collection) {
            polygonIDArray.push(polygon_id);
        }
        data = JSON.stringify(polygonIDArray);
        $.ajax({
            type: "POST",
            url: "/api/process_intersection",
            data: {polygonIDs:data},
            success: function(data) {
                console.log(data);
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $('#process-polygons').click(function() {
        var polygonDictionary = {};
        for (var polygon_id in polygons.collection) {
            var arr = polygons.collection[polygon_id].path;
            polygonDictionary[polygon_id] = arr.getArray();
        }
        data = JSON.stringify(polygonDictionary);
        $.ajax({
            type: "POST",
            url: "/api/process_polygons",
            data: {coords:data},
            success: function(data) {
                if (data > 1) {
                    $("#find-intersections").show();
                } else {
                    $("#find-intersections").hide();
                }
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
}
$(document).ready(function() {
    $("#find-intersections").hide();
});
