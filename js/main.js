function problem ( message ) {
    console.log(message);
    alert(message);
}

function plot ( map , GeoJSON ) {
    return L.geoJson(
        GeoJSON,
        {
            pointToLayer: function ( geojson , coordinate ) {
                var style = {};
                if (geojson.properties != null) {
                    style = {
                        className:   (typeof geojson.properties.className   === "string")  ? geojson.properties.className   : "",
                        stroke:      (typeof geojson.properties.stroke      === "boolean") ? geojson.properties.stroke      : true,
                        dashArray:   (typeof geojson.properties.dashArray   === "string")  ? geojson.properties.dashArray   : null,
                        weight:      (typeof geojson.properties.weight      === "number")  ? geojson.properties.weight      : 4,
                        color:       (typeof geojson.properties.color       === "string")  ? geojson.properties.color       : "#000",
                        opacity:     (typeof geojson.properties.opacity     === "number")  ? geojson.properties.opacity     : 1.0,
                        radius:      (typeof geojson.properties.radius      === "number")  ? geojson.properties.radius      : 8,
                        fill:        (typeof geojson.properties.fill        === "boolean") ? geojson.properties.fill        : true,
                        fillColor:   (typeof geojson.properties.fillColor   === "string")  ? geojson.properties.fillColor   :
                                     (typeof geojson.properties.image       === "string")  ? "#E79" : "#5Af",
                        fillOpacity: (typeof geojson.properties.fillOpacity === "number")  ? geojson.properties.fillOpacity : 0.8
                    }
                }
                return L.circleMarker(coordinate,style);
            },
            onEachFeature: function ( geojson , layer ) {
                if (geojson.properties != null) {
                    var popup = "";
                    if (geojson.properties.timestamp != null) popup += "<span style='font-weight:bold;'>"+(new Date(geojson.properties.timestamp))+"</span><br>";
                    if (geojson.properties.text      != null) popup += geojson.properties.text+"<br>";
                    if (geojson.properties.image     != null) popup += "<img style='width:300px; height:auto;' src='data:image/jpeg;base64,"+geojson.properties.image+"'><br>";
                    if (geojson.properties.source    != null) popup += "<small style='font-style:italic;'>from "+geojson.properties.source+"</small>";
                    if (popup !== "") layer.bindPopup("<p style='text-align:left;'>"+popup+"</p>");
                }
            }
        }
    ).addTo(map);
}


function processFeature ( epicenter ) {
    // TODO Verify epicenter.properties.
    if (typeof epicenter.properties.radius === "number") {
        L.circle(
            [epicenter.geometry.coordinates[1],epicenter.geometry.coordinates[0]],
            epicenter.properties.radius,
            { // TODO Add other options for appearance modification, and make them accessible from the GeoJSON file.
                weight: 1,
                color: "#000",
                opacity: 1.0,
                fillColor: "#fff",
                fillOpacity: 0.4
            }
        ).addTo(map);
    }
    // TODO Add other options for appearance modification, and make them accessible from the GeoJSON file.
    L.marker([epicenter.geometry.coordinates[1],epicenter.geometry.coordinates[0]])
        .bindPopup(epicenter.properties.data)
        .addTo(map);
    if (isFeatureCollection(epicenter.properties.related)) {
        return plot(map,epicenter.properties.related).getBounds();
    }
    else return map.getBounds();
}



var map = L.map("map").setView([0,0],0);
L.tileLayer(
    "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
    }
).addTo(map);

var queryString = {}
window.location.search.substr(1).split("&").forEach( // TODO Upgrade this.
    function ( item ) {
        queryString[item.split("=")[0]] = item.split("=")[1]
    }
)
$.getJSON("data/"+queryString.data)
.done(function ( geojson ) {
    if (!isGeoJSON(geojson)) problem(
        "Error: "+queryString.data+" must be a valid GeoJSON file!\n" +
        "\n" +
        "See http://geojson.org/ for more information."
    );
    else if (isFeature(geojson)) {
        map.fitBounds(processFeature(geojson));
    }
    else if (isFeatureCollection(geojson)) {
        var mapBounds;
        for (var featurei in geojson.features) {
            var layerBounds = processFeature(geojson.features[featurei]);
            if (featurei == 0) mapBounds = layerBounds;
            else mapBounds.extend(layerBounds);
        }
        map.fitBounds(mapBounds);
    }
    else map.fitBounds(plot(map,geojson).getBounds());
})
.fail(function ( response , error , statusText ) {
    problem(
        (response.status === 404) ?
            "Error: " +queryString.data+" could not be found.":
            "Error: " +statusText
    );
})
