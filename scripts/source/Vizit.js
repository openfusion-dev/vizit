var GeoJSON = require('./node_modules/gjtk');
var plain = require('./visualizers/plain');
var spatial = require('./visualizers/spatial');


// TODO
var vizit = {
    canvas: document.getElementById('canvas'),
    data: null,
    supported_visualizations: [
        'plain',
        'spatial'
    ],
    toggle: document.getElementById('toggle'),
    visualization: 'plain'
}


window.Vizit = {
    
    
    version: '0.1.0',
    
    
    error: function ( message ) {
        // Handle Vizit errors.
        if (message == null) message = 'An error occurred in Vizit.';
        console.error(message);
        alert(message);
        window.location.assign('//openfusion-dev.github.io/vizit/');
        throw new Error(message);
    },
    
    
    nextVisualization: function ( current ) {
        // Find the next visualization to be instated.
        var nexti = vizit.supported_visualizations.indexOf(current)+1;
        if (nexti == vizit.supported_visualizations.length) nexti = 0;
        return vizit.supported_visualizations[nexti];
    },
    
    
    visualize: function ( type ) {
        // Instate a visualization.
        type = type.toLowerCase();
        switch (type.toLowerCase()) {
            case 'spatial':
                vizit.visualization = 'spatial';
                document.getElementById('version').style.visibility = 'hidden';
                if (typeof OpenFusion !== 'undefined' &&
                    vizit.data.OpenFusion != null
                ) {
                    OpenFusion.spatial.preprocessor(vizit.data);
                }
                vizit.map = spatial.visualizer(vizit.data,vizit.canvas.id);
                break;
            case 'plain':
                vizit.visualization = 'plain';
                document.getElementById('version').style.visibility = 'visible';
                if (typeof OpenFusion !== 'undefined' &&
                    vizit.data.OpenFusion != null
                ) {
                    OpenFusion.plain.preprocessor(vizit.data);
                }
                plain.visualizer(vizit.data,vizit.canvas.id)
                break;
            default:
                Vizit.error(
                    'Supported visualizations: '+vizit.supported_visualizations
                );
        }
    },
    
    
    unvisualize: function ( ) {
        // Clear the canvas of all visualizations.
        if (vizit.map != null) {
            vizit.map.remove();
            vizit.map = null;
        }
        var canvas = document.createElement('div');
        canvas.id = vizit.canvas.id;
        vizit.canvas.parentNode.insertBefore(canvas,vizit.canvas.nextSibling);
        vizit.canvas.parentElement.removeChild(vizit.canvas);
        vizit.canvas = canvas;
    },
    
    
    visualizeNext: function ( ) {
        // Instate another visualization.
        var next = Vizit.nextVisualization(vizit.visualization);
        Vizit.unvisualize();
        vizit.toggle.innerHTML = Vizit.nextVisualization(next);
        Vizit.visualize(next);
    },
    
    
    init: function ( geojson , visualization , canvasID , toggleID ) {
        // Set up Vizit and instate the first visualization.
        if (GeoJSON.isGeoJSON(geojson)) {
            vizit.data = geojson;
            vizit.canvas = document.getElementById(canvasID);
            vizit.toggle = document.getElementById(toggleID);
            vizit.toggle.addEventListener('click',Vizit.visualizeNext,false);
            vizit.toggle.innerHTML = Vizit.nextVisualization(visualization);
            Vizit.visualize(visualization);
        }
        else Vizit.error(
            'Error: Only valid GeoJSON resources can be visualized!\n' +
            '\n' +
            'See http://geojson.org/ for more information.'
        );
    },
    
    
    features: function (geojson) {
        // Recursively extract GeoJSON Features from a data set.
        var features = [];
        GeoJSON.featuresOf(geojson).map(
            function ( Feature ) {
                features.push(Feature);
                if (
                    Feature.properties != null &&
                    GeoJSON.isFeatureCollection(Feature.properties.related)
                ) {
                    Vizit.features(Feature.properties.related).forEach(
                        function ( Feature ) {
                            features.push(Feature);
                        }
                    );
                }
            }
        );
        return features;
    },
    
    
// TODO ///////////////////////////////////////////////////////////////////// 80
    HTMLFeature: function ( Feature ) {
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
                popup +=
                    '<img src="data:image/jpeg;base64,'+properties.image+'">';
            }
        }
        return popup;
    }
// TODO ///////////////////////////////////////////////////////////////////// 80
    
    
};
