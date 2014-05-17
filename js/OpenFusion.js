// This library depends on GeoJSON.js.


var OpenFusion = {
    
    error: function ( name ) {
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
        console.error(message);
    },
    
    plain: {
        preprocessor: function ( geojson ) {
            // Prepare OpenFusion GeoJSON files for plain visualization.
            switch (geojson.OpenFusion) {
                case '1':
                case '2':
                    OpenFusion.error('unsupported');
                default: return geojson;
                case '3':
                case '4':
                case '5':
                    return geojson;
            }
            return geojson;
        }
    },
    
    spatial: {
        
        epicenterHandler: function ( feature ) {
            // Prepare OpenFusion GeoJSON epicenter features for visualization.
            var properties = feature.properties;
            properties.marker = 'Marker';
        },
        
        aftershockHandler: function ( feature ) {
            // Prepare OpenFusion GeoJSON aftershock features for visualization.
            var properties = feature.properties;
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
        },
        
        preprocessor: function ( geojson ) {
            // Prepare OpenFusion GeoJSON files for spatial visualization.
            switch (geojson.OpenFusion) {
                case '1':
                case '2':
                    OpenFusion.error('unsupported');
                default: return geojson;
                case '3':
                case '4':
                case '5':
                    OpenFusionMapGeoJSON(
                        geojson,
                        OpenFusion.spatial.epicenterHandler,
                        OpenFusion.spatial.aftershockHandler
                    );
            }
        }
    }
    
};


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


///////////////////////////////////////////////////////////////////////////// 80
function OpenFusionMapGeoJSONProper (  // TODO
    geojson,
    FeatureCallback  // TODO function FeatureCallback ( Feature , isEpicenter , isAftershock );
) {
    // Apply functions to each epicenter or aftershock.  // TODO Update this.
    
    if (typeof FeatureCallback === 'function') {
        GeoJSON.mapFeatures(
            geojson,
            function ( epicenter ) {
                if (typeof epicenter.properties.related === 'undefined') {
                    
                }
                else FeatureCallback(epicenter,true);
                if (GeoJSON.isFeatureCollection(epicenter.properties.related)) {
                    var aftershocks = epicenter.properties.related;
                    for (var aftershocki in aftershocks.features) {
                        var aftershock = aftershocks.features[aftershocki];
                        if (typeof aftershockHandler === 'function') {
                            aftershockHandler(aftershock);
                        }
                    }
                }
                else OpenFusion.error('malformed');
            }
        );
    }
}
///////////////////////////////////////////////////////////////////////////// 80


function OpenFusionMapGeoJSON (  // TODO What about recursion???
    geojson,
    epicenterHandler,
    aftershockHandler
) {
    // Apply functions to each epicenter or aftershock.
    if (GeoJSON.isFeatureCollection(geojson)) {
        GeoJSON.mapFeatures(
            geojson,
            function ( epicenter ) {
                if (typeof epicenterHandler === 'function') {
                    epicenterHandler(epicenter);
                }
                if (typeof epicenter.properties.related === 'undefined') return;
                if (GeoJSON.isFeatureCollection(epicenter.properties.related)) {
                    var aftershocks = epicenter.properties.related;
                    for (var aftershocki in aftershocks.features) {
                        var aftershock = aftershocks.features[aftershocki];
                        if (typeof aftershockHandler === 'function') {
                            aftershockHandler(aftershock);
                        }
                    }
                }
                else OpenFusion.error('malformed');
            }
        );
    }
    else OpenFusion.error('malformed');
}
