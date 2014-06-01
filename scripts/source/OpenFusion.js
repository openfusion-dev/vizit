// This library depends on GeoJSON.


window.OpenFusion = {
    
    
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
    
    
    map: function (  // TODO Fix this name.
        geojson,
        epicenterHandler,
        aftershockHandler
    ) {
        // Apply functions to each epicenter or aftershock.
        if (GeoJSON.isFeatureCollection(geojson)) {
            GeoJSON.featuresOf(geojson).map(
                function ( epicenter ) {
                    if (typeof epicenterHandler === 'function') {
                        epicenterHandler(epicenter);
                    }
                    var related = epicenter.properties.related;
                    if (GeoJSON.isFeatureCollection(related)) {
                        if (typeof aftershockHandler === 'function') {
                            related.features.forEach(aftershockHandler);
                        }
                    }
                    else if (related != null) OpenFusion.error('malformed');
                }
            );
        }
        else OpenFusion.error('malformed');
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
        
        
        epicenterProcessor: function ( feature ) {
            // Prepare OpenFusion GeoJSON epicenter features for visualization.
            var properties = feature.properties;
            properties.marker = 'Marker';
        },
        
        
        aftershockProcessor: function ( feature ) {
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
                    OpenFusion.map(
                        geojson,
                        OpenFusion.spatial.epicenterProcessor,
                        OpenFusion.spatial.aftershockProcessor
                    );
            }
        }
        
        
    }
    
    
};
