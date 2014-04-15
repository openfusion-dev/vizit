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
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
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


function processFeatureSpatially ( map , layer , feature ) {
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
        processFeatureCollectionSpatially(map,layer,feature.properties.related);
    }
}


function processFeatureCollectionSpatially ( map , layer , featureCollection ) {
    for (var featurei in featureCollection.features) {
        processFeatureSpatially(map,layer,featureCollection.features[featurei]);
    }
}


function processGeoJSONspatially ( map , layer , GeoJSON ) {
    if (isFeature(GeoJSON)) {
        if (GeoJSON.geometry !== null) processFeatureSpatially(map,layer,GeoJSON);
    }
    else if (isFeatureCollection(GeoJSON)) {
        if (GeoJSON.features.length > 0) processFeatureCollectionSpatially(map,layer,GeoJSON);
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


function styleObjectSpatially ( GeoJSONObject , layer ) {
    if (GeoJSONObject.properties != null) {
        var properties = GeoJSONObject.properties;
        var popup = "";
        if (properties.time   != null) popup += '<time datetime="'+properties.time+'">'+(new Date(properties.time))+"</time>";
        if (properties.text   != null) popup += "<blockquote>"+properties.text+"</blockquote>";
        if (properties.image  != null) popup += '<img src="data:image/jpeg;base64,'+properties.image+'">';
        if (properties.source != null) popup += '<cite>from '+properties.source+'</cite>';
        if (popup !== "") layer.bindPopup('<div class="popup">'+popup+'</div>');
    }
}


function visualizeSpatially ( GeoJSON ) {
    if (GeoJSON.OpenFusion != null) {
        GeoJSON = OpenFusionSpatialPreprocessor(GeoJSON);
    }
    var map = spatialVisualization();
    var dataLayer = L.geoJson(
        null,
        {
            pointToLayer: styleMarkerSpatially,
            onEachFeature: styleObjectSpatially
        }
    ).addTo(map);
    processGeoJSONspatially(map,dataLayer,GeoJSON);
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
