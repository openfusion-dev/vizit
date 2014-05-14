// This script depends on jQuery and vizit.js.


function parseQueryString ( URI ) {
    var parameters = {}
    URI.search.substr(1).split('&').forEach(
        function ( item ) {
            parameters[item.split('=')[0]] = item.split('=')[1]
        }
    )
    return parameters;
}


(function ( ) {
    var GET = parseQueryString(window.location);
    if (typeof GET.type === 'undefined') GET.type = 'spatial';
    else if (GET.type === 'raw') GET.type = 'plain';
    else if (GET.type === 'map') GET.type = 'spatial';
    if (GET.data) {
        $.getJSON('data/'+GET.data)
            .done(
                function ( JSON ) {
                    VizitInit(JSON,GET.type,'canvas','toggle');
                }
            )
            .fail(
                function ( response , error , statusText ) {
                    VizitError(
                        (response.status == 404) ?
                            'Error: ' +GET.data+' could not be found.':
                            'Error: ' +statusText
                    );
                }
            );
    }
    else VizitError();
})();
