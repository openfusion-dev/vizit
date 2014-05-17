// This library depends on GeoJSON.js and visualizers/*.js.


var Vizit = {
    
    error: function ( message ) {
        // Handle Vizit errors.
        if (message == null) message = 'An error occurred in Vizit.';
        console.error(message);
        alert(message);
        window.location.assign('//dmtucker.github.io/vizit/');
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
                vizit.map = spatialVisualizer(vizit.data,vizit.canvas.id);
                break;
            case 'plain':
                vizit.visualization = 'plain';
                plainVisualizer(vizit.data,vizit.canvas.id)
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
    }
    
};
