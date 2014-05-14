// This library depends on Leaflet, LeafletSlider, GeoJSON.js, and OpenFusion.js.


function spatialVisualization ( canvas ) {
    // Instantiate a spatial visualization, and add it to the canvas.
    var map = L.map(canvas).setView([0,0],3);
    L.tileLayer(
        'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        {
            minZoom: 0,
            maxZoom: 24,
            maxNativeZoom: 18,
            tileSize: 256,
            subdomains: 'abc',
            errorTileUrl: '',
            attribution:
                '&copy;' +
                ' <a href="http://osm.org/copyright">OpenStreetMap</a>' +
                ' contributors',
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
    ).addTo(map);
    return map;
}


function spatialFeatureStylist ( Feature , coordinate ) {
    // Apply marker styling from each Feature's properties.
    if (Feature.properties != null) {
        var properties = Feature.properties;
        if (properties.marker === 'Marker') {
            var markerOptions = {}
            if (properties.markerOptions != null) {
                markerOptions = properties.markerOptions;
            }
            return L.marker(coordinate,markerOptions);
        }
        else if (properties.marker === 'CircleMarker') {
            var pathOptions = {}
            if (properties.markerOptions != null) {
                pathOptions = properties.markerOptions;
            }
            return L.circleMarker(coordinate,pathOptions);
        }
    }
    return L.marker(coordinate);
}


function spatialGeoJSONStylist ( GeoJSON , layer ) {
    // Render each Feature's properties.
    if (GeoJSON.properties != null) {
        var popup = OpenFusionHTMLFeature(GeoJSON);  // TODO This does not respect GeoJSON styling of non-OpenFusion files!
        if (popup !== '') layer.bindPopup(
            '<article class="popup">'+popup+'</article>'
        );
    }
}


function spatialFeatureProcessor ( map , layer , Feature ) {
    // Plot each Feature with its accompanying radius and related features.
    if (typeof Feature.properties.radius === 'number') {
        var pathOptions = {
            stroke: true,
            color: '#000',
            weight: 1,
            opacity: 1.0,
            fill: true,
            fillColor: '#fff',
            fillOpacity: 0.4,
            dashArray: null,
            lineCap: null,
            lineJoin: null,
            clickable: true,
            pointerEvents: null,
            className: ''
        }
        if (Feature.properties.radiusOptions != null) {
            var radiusOptions = Feature.properties.radiusOptions;
            if (typeof radiusOptions.stroke === 'boolean') {
                pathOptions.stroke = radiusOptions.stroke;
            }
            if (typeof radiusOptions.color === 'string') {
                pathOptions.color = radiusOptions.color;
            }
            if (typeof radiusOptions.weight === 'number') {
                pathOptions.weight = radiusOptions.weight;
            }
            if (typeof radiusOptions.opacity === 'number') {
                pathOptions.opacity = radiusOptions.opacity;
            }
            if (typeof radiusOptions.fill === 'boolean') {
                pathOptions.fill = radiusOptions.fill;
            }
            if (typeof radiusOptions.fillColor === 'string') {
                pathOptions.fillColor = radiusOptions.fillColor;
            }
            if (typeof radiusOptions.fillOpacity === 'number') {
                pathOptions.fillOpacity = radiusOptions.fillOpacity;
            }
            if (typeof radiusOptions.dashArray === 'string') {
                pathOptions.dashArray = radiusOptions.dashArray;
            }
            if (typeof radiusOptions.lineCap === 'string') {
                pathOptions.lineCap = radiusOptions.lineCap;
            }
            if (typeof radiusOptions.lineJoin === 'string') {
                pathOptions.lineJoin = radiusOptions.lineJoin;
            }
            if (typeof radiusOptions.clickable === 'boolean') {
                pathOptions.clickable = radiusOptions.clickable;
            }
            if (typeof radiusOptions.pointerEvents === 'string') {
                pathOptions.pointerEvents = radiusOptions.pointerEvents;
            }
            if (typeof radiusOptions.className === 'string') {
                pathOptions.className = radiusOptions.className;
            }
        }
        L.circle(
            [
                Feature.geometry.coordinates[1],
                Feature.geometry.coordinates[0]
            ],
            Feature.properties.radius,
            pathOptions
        ).addTo(map);
    }
    layer.addData(Feature);
    if (isFeatureCollection(Feature.properties.related)) {
        spatialFeatureCollectionProcessor(map,layer,Feature.properties.related);
    }
}


function spatialFeatureCollectionProcessor ( map , layer , FeatureCollection ) {
    // Process each feature in a FeatureCollection individually.
    for (var featurei in FeatureCollection.features) {
        spatialFeatureProcessor(map,layer,FeatureCollection.features[featurei]);
    }
}


function spatialGeoJSONProcessor ( map , layer , GeoJSON ) {
    // Plot GeoJSON data.
    if (isFeature(GeoJSON)) {
        if (GeoJSON.geometry !== null) {
            spatialFeatureProcessor(map,layer,GeoJSON);
        }
    }
    else if (isFeatureCollection(GeoJSON)) {
        if (GeoJSON.features.length > 0) {
            spatialFeatureCollectionProcessor(map,layer,GeoJSON);
        }
    }
    else if (!isGeometryCollection(GeoJSON) || GeoJSON.geometries.length > 0) {
        layer.addData(GeoJSON);
    }
}


function spatialVisualizer ( GeoJSON , canvasID ) {
    // Instate a spatial visualization.
    if (GeoJSON.OpenFusion != null) OpenFusionSpatialPreprocessor(GeoJSON);
    var map = spatialVisualization(canvasID);
    var dataLayer = L.geoJson(
        null,
        {
            pointToLayer: spatialFeatureStylist,
            onEachFeature: spatialGeoJSONStylist
        }
    ).addTo(map);
    spatialGeoJSONProcessor(map,dataLayer,GeoJSON);
    map.fitBounds(dataLayer);
    
    if (isFeatureCollection(GeoJSON) && GeoJSON.features.length > 1) {
        var slider = L.control.sliderControl({
            position: 'topright',
            layer: dataLayer,
            range: true
        });
        map.addControl(slider);
        slider.startSlider();
    }
}
