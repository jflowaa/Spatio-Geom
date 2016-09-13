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
    },
    generatColor: function(e){
        var colorVal ="#";
        for(var x=0; x<6; x++){
            var randNum = Math.floor(Math.random() * 10) + 6;
            switch(randNum){
                case 10:
                    colorVal += "A";
                    break;
                case 11:
                    colorVal+="B";
                    break;
                case 12:
                    colorVal+="C";
                    break;
                case 13:
                    colorVal+="D";
                    break;
                case 14:
                    colorVal+="E";
                    break;
                case 15:
                    colorVal+="F";
                    break;
                default:
                    colorVal+=randNum.toString();
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
        fillColor : polygons.generatColor(),
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
        polygonOptions.fillColor = polygons.generatColor();
        drawingManager.set('polygonOptions', polygonOptions);
        polygons.add(event);
    });
    $('#find-intersections-form').click(function() {
        var polygonIDArray = [];
        for (var key in polygons.collection) {
            polygonIDArray.push(key);
        }
        data = JSON.stringify(polygonIDArray);
        $.ajax({
            type: "POST",
            url: "/api/find_intersections",
            data: {polygonIDs:data},
            success: function(data) {
                console.log(data);
            },
            failure: function(data) {
                console.log(data);
            }
        });
    });
    $('#find-unions-form').click(function() {
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
    $('#create-regions-form').click(function() {
        var polygonDictionary = {};
        for (var polygon_id in polygons.collection) {
            var arr = polygons.collection[polygon_id].path;
            polygonDictionary[polygon_id] = arr.getArray();
        }
        data = JSON.stringify(polygonDictionary);
        $.ajax({
            type: "POST",
            url: "/api/create_regions",
            data: {coords:data},
            success: function(data) {
                if (data > 1) {
                    $("#find-intersections").show();
                    $("#find-unions").show();
                } else {
                    $("#find-intersections").hide();
                    $("#find-unions").hide();
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
    $("#find-unions").hide();
});
