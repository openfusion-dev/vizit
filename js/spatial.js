function spatialVisualization ( ) {
    var visualization = L.map("canvas").setView([0,0],3);
    L.tileLayer(
        "http://{s}.tile.osm.org/{z}/{x}/{y}.png",
        {
            minZoom: 0,
            maxZoom: 24,
            maxNativeZoom: 18,
            tileSize: 256,
            subdomains: "abc",
            errorTileUrl: "",
            attribution: "&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors",
            tms: false,
            continuousWorld: false,
            noWrap: true,
            zoomOffset: 0,
            zoomReverse: false,
            opactiy: 1.0,
            zIndex: null,
            unloadInvisibleTiles: false,
            updateWhenIdle: false,
            detectRetina: false,
            reuseTiles: false,
            bounds: null
        }
    ).addTo(visualization);
    return visualization;
}


function processFeatureSpatially ( feature , layer ) {
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
    layer.addData(feature);
    if (isFeatureCollection(feature.properties.related)) {
        processFeatureCollectionSpatially(feature.properties.related,layer);
    }
}


function processFeatureCollectionSpatially ( featureCollection , layer ) {
    for (var featurei in featureCollection.features) {
        processFeatureSpatially(featureCollection.features[featurei],layer);
    }
}


function processGeoJSONspatially ( GeoJSON , layer ) {
    if (isFeature(GeoJSON)) {
        if (GeoJSON.geometry !== null) processFeatureSpatially(GeoJSON,layer);
    }
    else if (isFeatureCollection(GeoJSON)) {
        if (GeoJSON.features.length > 0) processFeatureCollectionSpatially(GeoJSON,layer);
    }
    else if (!isGeometryCollection(GeoJSON) || GeoJSON.geometries.length > 0) {
        layer.addData(GeoJSON);
    }
}


function styleMarkerSpatially ( feature , coordinate ) {
    if (feature.properties != null) {
        var properties = feature.properties;
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
}


function styleFeatureSpatially ( GeoJSONObject , layer ) {
    if (GeoJSONObject.properties != null) {
        var properties = GeoJSONObject.properties;
        var popup = "";
        if (properties.time   != null) popup += "<span style='font-weight:bold;'>"+(new Date(properties.time))+"</span><br>";
        if (properties.text   != null) popup += properties.text+"<br>";
        if (properties.image  != null) popup += "<img style='width:300px; height:auto;' src='data:image/jpeg;base64,"+properties.image+"'><br>";
        if (properties.source != null) popup += "<small style='font-style:italic;'>from "+properties.source+"</small>";
        if (popup !== "") layer.bindPopup("<p style='text-align:left;'>"+popup+"</p>");
    }
}


function visualizeSpatially ( GeoJSON ) {
    if (GeoJSON.OpenFusion != null) {
        GeoJSON = OpenFusionSpatialPreprocessor(GeoJSON);
    }
    map = spatialVisualization();
    var dataLayer = L.geoJson(
        null,
        {
            pointToLayer: styleMarkerSpatially,
            onEachFeature: styleFeatureSpatially
        }
    ).addTo(map);
    processGeoJSONspatially(GeoJSON,dataLayer);
    map.fitBounds(dataLayer);
    
    if (isFeatureCollection(GeoJSON)) {
        var slider = L.control.sliderControl({
            position: "topright",
            layer: dataLayer,
            range: true
        });
        map.addControl(slider);
        slider.startSlider();
    }
}
