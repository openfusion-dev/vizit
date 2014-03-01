var queryString = {}
window.location.search.substr(1).split("&").forEach(
    function (item) {
        queryString[item.split("=")[0]] = item.split("=")[1]
    }
)
if (!queryString.hasOwnProperty("data")) {
    alert(
        "A JSON file must be specified in the query string.\n" +
        "\n" +
        "Example\n" +
        window.location.protocol+"//"+window.location.host+window.location.pathname+"?data=points.json"
    );
    window.location = "http://gsf.soe.ucsc.edu";
}


function initializeGoogleMaps () {
    var map = new google.maps.Map(
        document.getElementById("map-canvas"),
        {
            center: new google.maps.LatLng(36.9720,-122.0263),
            zoom: 14
        }
    );
}
google.maps.event.addDomListener(window,"load",initializeGoogleMaps);


var response = $.getJSON(
    queryString.data,
    function (data) {
        console.log(data); // alert(JSON.stringify(data)); # TODO Remove this line when it is no longer useful.
        // TODO Process and plot GeoJSON data.
    }
);
