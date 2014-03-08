var queryString = {}
window.location.search.substr(1).split("&").forEach(
    function (item) {
        queryString[item.split("=")[0]] = item.split("=")[1]
    }
)
if (!queryString.hasOwnProperty("data")) {
    alert(
        "A GeoJSON file must be specified in the query string.\n" +
        "\n" +
        "Example\n" +
        window.location.protocol+"//"+window.location.host+window.location.pathname+"?data=points.geojson"
    );
    window.location = "http://gsf.soe.ucsc.edu";
}




var map = L.map("map").locate({setView: true, maxZoom: 13});
L.tileLayer(
    "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
    }
).addTo(map);

var response = $.getJSON(
    queryString.data,
    function (data) {
        console.log(data); // TODO Remove this line when it is no longer useful.
        L.geoJson(
            data,
            {
                onEachFeature: function (feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            }
        ).addTo(map);
    }
);
