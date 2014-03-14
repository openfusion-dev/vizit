function unvisualizable ( message ) {
    console.log(message);
    alert(message);
    window.location.assign("http://gsf.soe.ucsc.edu");
    throw new Error("unvisualizable"); // This prevents further execution after redirecting.
}

function plot ( map , GeoJSON ) {
    return L.geoJson(
        GeoJSON,
        {
            pointToLayer: function ( feature , coordinate ) {
                return L.circleMarker(
                    coordinate,
                    {
                        className:   (typeof feature.properties.className   === "undefined") ? ""     : feature.properties.className,
                        stroke:      (typeof feature.properties.stroke      === "undefined") ? true   : feature.properties.stroke,
                        dashArray:   (typeof feature.properties.dashArray   === "undefined") ? null   : feature.properties.dashArray,
                        //lineCap: null, //butt, round, square // TODO Figure out if these are applicable.
                        //lineJoin: null, //miter, round, bevel // TODO Figure out if these are applicable.
                        weight:      (typeof feature.properties.weight      === "undefined") ? 4      : feature.properties.weight,
                        color:       (typeof feature.properties.color       === "undefined") ? "#000" : feature.properties.color,
                        opacity:     (typeof feature.properties.opacity     === "undefined") ? 1.0    : feature.properties.opacity,
                        radius:      (typeof feature.properties.radius      === "undefined") ? 8      : feature.properties.radius,
                        fill:        (typeof feature.properties.fill        === "undefined") ? true   : feature.properties.fill,
                        fillColor:   (typeof feature.properties.fillColor   === "undefined") ? "#5Af" : feature.properties.fillColor,
                        fillOpacity: (typeof feature.properties.fillOpacity === "undefined") ? 0.8    : feature.properties.fillOpacity
                    }
                )
            },
            onEachFeature: function ( feature , layer ) {
                var popup = "";
                if (typeof feature.properties.timestamp !== "undefined") {
                    var timestamp = new Date(feature.properties.timestamp);
                    popup += JSON.stringify(timestamp).replace(/\"/g,"")+"<br>";
                }
                if (typeof feature.properties.text   !== "undefined") popup += feature.properties.text+"<br>";
                if (typeof feature.properties.image  !== "undefined") popup += "<img style='width:300px; height:auto;' src='data:image/jpeg;base64,"+feature.properties.image+"'><br>";
                if (typeof feature.properties.source !== "undefined") popup += "<small>from "+feature.properties.source+"</small>";
                if (popup != "") layer.bindPopup("<p style='text-align:left;'>"+popup+"</p>");
            }
        }
    ).addTo(map);
}




var queryString = {}
window.location.search.substr(1).split("&").forEach(
    function ( item ) {
        queryString[item.split("=")[0]] = item.split("=")[1]
    }
)
if (!queryString.hasOwnProperty("data")) unvisualizable(
    "Error: A GeoJSON file must be specified in the query string.\n" +
    "\n" +
    "Example\n" +
    window.location.protocol+"//"+window.location.host+window.location.pathname+"?data=points.geojson"
);
else $.getJSON("data/"+queryString.data)
    .done(function ( json ) {
        if (!isFeatureCollection(json)) unvisualizable(
            "Error: "+queryString.data+" must specify a FeatureCollection object!\n" +
            "\n" +
            "See http://geojson.org/ for more information."
        );
        var multiset = false;
        for (var i in json.features) {
            if (isFeatureCollection(json.features[i])) {
                multiset = true;
                break;
            }
        }
        
        var map = L.map("map").setView([0,0],0);
        L.tileLayer(
            "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
            }
        ).addTo(map);
        
        if (multiset) {
            var mapBounds;
            for (var seti in json.features) {
                if (!isFeatureCollection(json.features[seti])) unvisualizable(
                    "Error: "+queryString.data+" is malformed."
                );
                var epicenter = json.features[seti].features[0];
                if (typeof epicenter.properties.radius !== "undefined") {
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
                L.marker([epicenter.geometry.coordinates[1],epicenter.geometry.coordinates[0]])
                    .bindPopup(epicenter.properties.data)
                    .addTo(map);
                
                var layerBounds = plot(map,json.features[seti].features[1]).getBounds();
                if (seti == 0) mapBounds = layerBounds;
                mapBounds.extend(layerBounds);
            }
            map.fitBounds(mapBounds);
        }
        else map.fitBounds(plot(map,json).getBounds());
    })
    .fail(function ( response , error , statusText ) {
        unvisualizable(
            (response.status == 404) ?
                "Error: " +queryString.data+" could not be found.":
                "Error: " +statusText
        );
    })
