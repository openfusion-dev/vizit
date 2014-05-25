// This library depends on GeoJSON.


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
    
    
// TODO ///////////////////////////////////////////////////////////////////// 80
    mapGeoJSON: function (
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
                        if (typeof aftershockHandler === 'function') {
                            epicenter.properties.related.features.forEach(aftershockHandler);
                        }
                    }
                    else OpenFusion.error('malformed');
                }
            );
        }
        else OpenFusion.error('malformed');
    },
///////////////////////////////////////////////////////////////////////////// 80
    
    
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
                    OpenFusion.mapGeoJSON(
                        geojson,
                        OpenFusion.spatial.epicenterHandler,
                        OpenFusion.spatial.aftershockHandler
                    );
            }
        }
    }
};
