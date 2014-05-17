// This library depends on jQuery, and OpenFusion.js.


function plainFeatureProcessor ( Feature ) {
    // Generate HTML for each GeoJSON Feature.
    if (Feature.properties != null) {
        var canvas = this.canvas;
        var article = document.createElement('article');
        article.className = 'plain';
        article.innerHTML = OpenFusionHTMLFeature(Feature);  // TODO This does not respect GeoJSON styling of non-OpenFusion files!
        if (typeof Feature.properties.location === 'string') {
            article.innerHTML +=
                        '<address>'+Feature.properties.location+'</address>';
            canvas.appendChild(article);
        }
        else if (Feature.geometry.type === 'Point') $.get(
            'http://nominatim.openstreetmap.org/reverse' +
                '?format=xml' +
                '&lat='+Feature.geometry.coordinates[1].toString() +
                '&lon='+Feature.geometry.coordinates[0].toString()
        )
            .done(
                function ( XML ) {
                    Feature.properties.location = $(XML).find('result').text();
                    article.innerHTML +=
                        '<address>'+Feature.properties.location+'</address>';
                    canvas.appendChild(article);
                }
            )
            .fail(
                function ( response , error , statusText ) {
                    console.error('Error: '+statusText);
                }
            );
        return article;
    }
}

function plainEpicenterHandler ( Feature ) {
    // Process GeoJSON Features.
    var article = plainFeatureProcessor(Feature);
    if (typeof article !== 'undefined') article.className += ' epicenter';
}

function plainAftershockHandler ( Feature ) {
    // Process related Features in OpenFusion GeoJSON Features.
    var article = plainFeatureProcessor(Feature);
    if (typeof article !== 'undefined') article.className += ' aftershock';
}


function plainVisualizer ( geojson , canvasID ) {
    // Instate a plain visualization.
    if (geojson.OpenFusion != null) OpenFusion.plain.preprocessor(geojson);
    
    var context = {canvas:document.getElementById(canvasID)};
    var epicenterCallback = plainEpicenterHandler.bind(context);
    var aftershockCallback = plainAftershockHandler.bind(context);
    OpenFusionMapGeoJSON(  // TODO This adds an unnecessary dependency on OpenFusion.js!
        geojson,
        epicenterCallback,
        aftershockCallback
    );
}
