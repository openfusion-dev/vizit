function OpenFusionError ( name ) {
    // Handle OpenFusion errors.
    var message;
    switch (name) {
        case 'malformed':
            message = 'The specified OpenFusion GeoJSON is malformed.';
            break;
        case 'unsupported':
            message = 'Only OpenFusion v3 and above is supported';
            break;
        default:
            message = 'A problem occurred in the OpenFusion preprocessor.';
    }
    console.log(message);
}


function OpenFusionHTMLFeature ( Feature ) {
    // Create a string of HTML to style a feature.
    var popup = '';
    if (Feature.properties != null) {
        var properties = Feature.properties;
        if (properties.time != null) {
            var timestamp = new Date(properties.time);
            popup +=
                '<time datetime="'+JSON.stringify(timestamp)+'">' +
                    timestamp +
                '</time>';
        }
        if (properties.source != null) {
            popup += '<cite>'+properties.source+'</cite>';
        }
        if (properties.text != null) {
            popup += '<blockquote>'+properties.text+'</blockquote>';
        }
        if (properties.image != null) {
            popup += '<img src="data:image/jpeg;base64,'+properties.image+'">';
        }
    }
    return popup;
}


function OpenFusionMapGeoJSON (
    GeoJSON,
    epicenterHandler,
    aftershockHandler
) {
    // Apply functions to each epicenter or aftershock.
    if (isFeatureCollection(GeoJSON)) {
        mapFeatures(
            GeoJSON,
            function ( epicenter ) {
                if (typeof epicenterHandler === 'function') {
                    epicenterHandler(epicenter);
                }
                if (typeof epicenter.properties.related === 'undefined') return;
                if (isFeatureCollection(epicenter.properties.related)) {
                    var aftershocks = epicenter.properties.related;
                    for (var aftershocki in aftershocks.features) {
                        var aftershock = aftershocks.features[aftershocki];
                        if (typeof aftershockHandler === 'function') {
                            aftershockHandler(aftershock);
                        }
                    }
                }
                else OpenFusionError('malformed');
            }
        );
    }
    else OpenFusionError('malformed');
}


function OpenFusionPlainPreprocessor ( GeoJSON ) {
    // Prepare OpenFusion GeoJSON files for plain visualization.
    switch (GeoJSON.OpenFusion) {
        case '1':
        case '2':
            OpenFusionError('unsupported');
        default: return GeoJSON;
        case '3':
        case '4':
        case '5':
            return GeoJSON;
    }
    return GeoJSON;
}


function OpenFusionSpatialEpicenters ( Feature ) {
    // Prepare OpenFusion GeoJSON epicenter features for visualization.
    var properties = Feature.properties;
    properties.marker = 'Marker';
}


function OpenFusionSpatialAftershocks ( Feature ) {
    // Prepare OpenFusion GeoJSON aftershock features for visualization.
    var properties = Feature.properties;
    properties.marker = 'CircleMarker';
    properties.markerOptions = JSON.parse(
        JSON.stringify({
            stroke: true,
            color: '#000',
            weight: 4,
            opacity: 1.0,
            fill: true,
            fillColor: '#5Af',
            fillOpacity: 0.8,
            dashArray: null,
            lineCap: null,
            lineJoin: null,
            clickable: true,
            pointerEvents: null,
            className: '',
            radius: 8  // This Path Option is specific to CircleMarkers.
        })
    );  // This is necessary to create a copy.
    if (typeof properties.image === 'string') {
        properties.markerOptions.fillColor = '#E79';
    }
}


function OpenFusionSpatialPreprocessor ( GeoJSON ) {
    // Prepare OpenFusion GeoJSON files for spatial visualization.
    switch (GeoJSON.OpenFusion) {
        case '1':
        case '2':
            OpenFusionError('unsupported');
        default: return GeoJSON;
        case '3':
        case '4':
        case '5':
            OpenFusionMapGeoJSON(
                GeoJSON,
                OpenFusionSpatialEpicenters,
                OpenFusionSpatialAftershocks
            );
    }
}
