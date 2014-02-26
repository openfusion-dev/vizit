function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(36.9720,-122.0263),
        zoom: 14
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);
}
google.maps.event.addDomListener(window,"load",initialize);
