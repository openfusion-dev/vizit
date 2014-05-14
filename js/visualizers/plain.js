// This library depends on jQuery, GeoJSON.js, OpenFusion.js, and vizit.js.


function plainFeatureProcessor ( Feature ) {
    // Generate HTML for each GeoJSON Feature.
    var article = document.createElement('article');
    article.className = 'plain';
    article.innerHTML = OpenFusionHTMLFeature(Feature);  // TODO This does not respect GeoJSON styling of non-OpenFusion files!
    vizit.canvas.appendChild(article);  // TODO This makes this file dependent on vizit.js!
    $.get(
        'http://nominatim.openstreetmap.org/reverse' +
            '?format=xml' +
            '&lat='+Feature.geometry.coordinates[1].toString() +
            '&lon='+Feature.geometry.coordinates[0].toString()
    )
        .done(
            function ( XML ) {
                article.innerHTML +=
                    '<address>'+$(XML).find('result').text()+'</address>';
            }
        )
        .fail(
            function ( response , error , statusText ) {
                console.log('Error: '+statusText);
            }
        );
    return article;
}

function plainEpicenterHandler ( Feature ) {
    // Process GeoJSON Features.
    var article = plainFeatureProcessor(Feature);
    article.className += ' epicenter';
}

function plainAftershockHandler ( Feature ) {
    // Process related Features in OpenFusion GeoJSON Features.
    var article = plainFeatureProcessor(Feature);
    article.className += ' aftershock';
}


function plainVisualizer ( GeoJSON ) {
    // Instate a plain visualization.
    if (GeoJSON.OpenFusion != null) {
        OpenFusionPlainPreprocessor(GeoJSON);
        OpenFusionMapGeoJSON(
            GeoJSON,
            plainEpicenterHandler,
            plainAftershockHandler
        );
    }
    else mapFeatures(GeoJSON,plainEpicenterHandler);
}
