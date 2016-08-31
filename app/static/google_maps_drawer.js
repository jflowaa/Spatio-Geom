var map;
function initialize() {
  var mapProp = {
    center:new google.maps.LatLng(38.7931,-89.9967),
    zoom:10,
    mapTypeId:google.maps.MapTypeId.ROADMAP
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
        var newShape = event.overlay;
        newShape.type = event.type;
    });

    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event){
        overlayClickListener(event.overlay);
        $('#coords').val(event.overlay.getPath().getArray());
    });
}

function overlayClickListener(overlay) {
	google.maps.event.addListener(overlay, "mouseup", function(event){
    $('#coords').val(overlay.getPath().getArray());
	});
}
