function problem ( message ) {
    console.log(message);
    alert(message);
}


function parseQueryString ( uri ) {
    var parameters = {}
    uri.search.substr(1).split("&").forEach(
        function ( item ) {
            parameters[item.split("=")[0]] = item.split("=")[1]
        }
    )
    return parameters;
}


function plot ( map , GeoJSON ) {
    return L.geoJson(
        GeoJSON,
        {
            pointToLayer: function ( GeoJSONObject , coordinate ) {
                if (GeoJSONObject.properties != null) {
                    var properties = GeoJSONObject.properties;
                    if (properties.marker === "Marker") {
                        var markerOptions = {}
                        if (properties.markerOptions != null) markerOptions = properties.markerOptions;
                        return L.marker(coordinate,markerOptions);
                    }
                    else if (properties.marker === "CircleMarker") {
                        var pathOptions = {}
                        if (properties.markerOptions != null) pathOptions = properties.markerOptions;
                        return L.circleMarker(coordinate,pathOptions);
                    }
                }
                return L.marker(coordinate);
            },
            onEachFeature: function ( GeoJSONObject , layer ) {
                if (GeoJSONObject.properties != null) {
                    var properties = GeoJSONObject.properties;
                    var popup = "";
                    if (properties.timestamp != null) popup += "<span style='font-weight:bold;'>"+(new Date(properties.timestamp))+"</span><br>";
                    if (properties.text      != null) popup += properties.text+"<br>";
                    if (properties.image     != null) popup += "<img style='width:300px; height:auto;' src='data:image/jpeg;base64,"+properties.image+"'><br>";
                    if (properties.source    != null) popup += "<small style='font-style:italic;'>from "+properties.source+"</small>";
                    if (popup !== "") layer.bindPopup("<p style='text-align:left;'>"+popup+"</p>");
                }
            }
        }
    ).addTo(map);
}


function processFeature ( map , feature ) {
    if (typeof feature.properties.radius === "number") {
        var pathOptions = {
            stroke: true,
            color: "#000",
            weight: 1,
            opacity: 1.0,
            fill: true,
            fillColor: "#fff",
            fillOpacity: 0.4,
            dashArray: null,
            lineCap: null,
            lineJoin: null,
            clickable: true,
            pointerEvents: null,
            className: ""
        }
        if (feature.properties.radiusOptions != null) {
            var radiusOptions = feature.properties.radiusOptions;
            if (typeof radiusOptions.stroke        === "boolean") pathOptions.stroke        = radiusOptions.stroke;
            if (typeof radiusOptions.color         === "string")  pathOptions.color         = radiusOptions.color;
            if (typeof radiusOptions.weight        === "number")  pathOptions.weight        = radiusOptions.weight;
            if (typeof radiusOptions.opacity       === "number")  pathOptions.opacity       = radiusOptions.opacity;
            if (typeof radiusOptions.fill          === "boolean") pathOptions.fill          = radiusOptions.fill;
            if (typeof radiusOptions.fillColor     === "string")  pathOptions.fillColor     = radiusOptions.fillColor;
            if (typeof radiusOptions.fillOpacity   === "number")  pathOptions.fillOpacity   = radiusOptions.fillOpacity;
            if (typeof radiusOptions.dashArray     === "string")  pathOptions.dashArray     = radiusOptions.dashArray;
            if (typeof radiusOptions.lineCap       === "string")  pathOptions.lineCap       = radiusOptions.lineCap;
            if (typeof radiusOptions.lineJoin      === "string")  pathOptions.lineJoin      = radiusOptions.lineJoin;
            if (typeof radiusOptions.clickable     === "boolean") pathOptions.clickable     = radiusOptions.clickable;
            if (typeof radiusOptions.pointerEvents === "string")  pathOptions.pointerEvents = radiusOptions.pointerEvents;
            if (typeof radiusOptions.className     === "string")  pathOptions.className     = radiusOptions.className;
        }
        L.circle(
            [feature.geometry.coordinates[1],feature.geometry.coordinates[0]],
            feature.properties.radius,
            pathOptions
        ).addTo(map);
    }
    var bounds = plot(map,feature).getBounds();
    if (isFeatureCollection(feature.properties.related)) {
        return bounds.extend(processFeatureCollection(map,feature.properties.related));
    }
    else return bounds;
}


function processFeatureCollection ( map , featureCollection ) {
    var bounds;
    for (var featurei in featureCollection.features) {
        var layerBounds = processFeature(map,featureCollection.features[featurei]);
        if (featurei == 0) bounds = layerBounds;
        else bounds.extend(layerBounds);
    }
    return bounds;
}


function loadData ( map , file ) {
    $.getJSON("data/"+file)
        .done(function ( GeoJSON ) {
            if (!isGeoJSON(GeoJSON)) problem(
                "Error: "+file+" must be a valid GeoJSON file!\n" +
                "\n" +
                "See http://geojson.org/ for more information."
            );
            if (GeoJSON.OpenFusion != null) {
                GeoJSON = OpenFusionPreprocessor(GeoJSON);
            }
            if (isFeature(GeoJSON)) {
                if (GeoJSON.geometry !== null) map.fitBounds(processFeature(map,GeoJSON));
            }
            else if (isFeatureCollection(GeoJSON)) {
                if (GeoJSON.features.length > 0) map.fitBounds(processFeatureCollection(map,GeoJSON));
            }
            else if (!isGeometryCollection(GeoJSON) || GeoJSON.geometries.length > 0) {
                map.fitBounds(plot(map,GeoJSON).getBounds());
            }
        })
        .fail(function ( response , error , statusText ) {
            problem(
                (response.status === 404) ?
                    "Error: " +file+" could not be found.":
                    "Error: " +statusText
            );
        })
}


function drawMap ( ) {
    var map = L.map("map").setView([0,0],3);
    L.tileLayer(
        "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        }
    ).addTo(map);
    return map;
}


var OSM = drawMap();
var GET = parseQueryString(window.location);
if (GET.data != null) loadData(OSM,GET.data);
