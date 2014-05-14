// This library depends on GeoJSON.js and visualizers/*.js.
// This library does NOT depend on jQuery.


var vizit = {
    canvas: document.getElementById('canvas'),
    data: null,
    supported_visualizations: [
        'plain',
        'spatial'
    ],
    toggle: document.getElementById('toggle'),  // TODO Internalize this.
    visualization: 'plain'
}


function VizitError ( message ) {
    // Handle Vizit errors.
    if (message != null) {
        console.log(message);
        alert(message);
    }
    window.location.assign('//dmtucker.github.io/vizit/');
}


function VizitNextVisualization ( current ) {
    // Find the next visualization to be instated.
    var nexti = vizit.supported_visualizations.indexOf(current)+1;
    if (nexti == vizit.supported_visualizations.length) nexti = 0;
    return vizit.supported_visualizations[nexti];
}


function VizitVisualize ( type ) {
    // Instate a visualization.
    type = type.toLowerCase();
    switch (type.toLowerCase()) {
        case 'spatial':
            vizit.visualization = 'spatial';
            spatialVisualizer(vizit.data,vizit.canvas.id);
            break;
        case 'plain':
            vizit.visualization = 'plain';
            plainVisualizer(vizit.data)
            break;
        default:
            VizitError(
                'Supported visualizations: '+vizit.supported_visualizations
            );
    }
}


function VizitVisualizeNext ( ) {
    // Instate another visualization.
    var next = VizitNextVisualization(vizit.visualization);
    vizit.canvas.innerHTML = '';
    vizit.toggle.innerHTML = VizitNextVisualization(next);
    VizitVisualize(next);
}


function crappyToggleHackFIXME ( visualization ) {
    /* TODO
        The toggle only works once for now because of the
        way Leaflet loads the map. Since it cannot be undone
        simply by emptying the canvas, only plain to spatial
        toggles are supported.
    */
    if (visualization.toLowerCase() === 'plain') {
        vizit.toggle.style.display = 'inline-block';
        vizit.toggle.addEventListener(
            'click',
            function ( ) {
                VizitVisualizeNext();
                vizit.toggle.style.display = 'none';
                $(vizit.toggle).off();  // TODO This breaks respect for the 80-column boundary and this library's jQuery independence!
            },
            false
        );
    }
}


function VizitInit ( GeoJSON , visualization , canvasID , toggleID ) {
    // Set up Vizit and instate the first visualization.
    if (isGeoJSON(GeoJSON)) {
        vizit.data = GeoJSON;
        vizit.canvas = document.getElementById(canvasID);
        vizit.toggle = document.getElementById(toggleID);
        crappyToggleHackFIXME(visualization);
        vizit.toggle.innerHTML = VizitNextVisualization(visualization);
        VizitVisualize(visualization);
    }
    else VizitError(
        'Error: Only valid GeoJSON resources can be visualized!\n' +
        '\n' +
        'See http://geojson.org/ for more information.'
    );
}
