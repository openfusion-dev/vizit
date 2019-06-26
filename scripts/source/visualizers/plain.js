// This library depends on jQuery and Vizit.


var GeoJSON = require('../node_modules/gjtk');


var plain = module.exports = {
    
    
    version: '0.1.0',
    
    
    render: function ( Feature , canvas ) {
        // Generate HTML for each GeoJSON Feature.
        if (Feature.properties != null) {
            var article = document.createElement('article');
            article.className = 'plain';
            article.innerHTML = Vizit.HTMLFeature(Feature);
            if (typeof Feature.properties.location === 'string') {
                article.innerHTML +=
                            '<address>'+Feature.properties.location+'</address>';
                canvas.appendChild(article);
            }
            else if (Feature.geometry.type === 'Point') $.get(
                'https://nominatim.openstreetmap.org/reverse' +
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
    },
    
    
    visualizer: function ( geojson , canvasID ) {
        // Instate a plain visualization.
        var canvas = document.getElementById(canvasID);
        Vizit.features(geojson).map(
            function ( Feature ) {
                var article = plain.render(Feature,canvas);
                if (typeof article !== 'undefined') {
                    article.className +=
                        (GeoJSON.isFeatureCollection(Feature.properties.related)) ?
                            ' epicenter':
                            ' aftershock';
                }
            }
        );
    }
    
    
}
