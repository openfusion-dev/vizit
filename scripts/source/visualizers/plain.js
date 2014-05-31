// This library depends on jQuery and Vizit.


exports.version = '0.1.0';


exports.renderFeature = function ( Feature ) {
    // Generate HTML for each GeoJSON Feature.
    if (Feature.properties != null) {
        //var canvas = this.canvas;
        var article = document.createElement('article');
        article.className = 'plain';
        article.innerHTML = Vizit.HTMLFeature(Feature);
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
        else if (article.innerHTML != '') canvas.appendChild(article);
        return article;
    }
}


exports.visualizer = function ( geojson , canvasID ) {
    // Instate a plain visualization.
    var context = {canvas:document.getElementById(canvasID)};
    exports.FeatureProcessor.bind(context);
    Vizit.features(geojson).map(
        function ( Feature ) {
            var article = exports.renderFeature(Feature);
            if (typeof article !== 'undefined') {
                article.className +=
                    (GeoJSON.isFeatureCollection(Feature.properties.related)) ?
                        ' epicenter':
                        ' aftershock';
            }
        }
    );
}
