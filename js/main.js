function problem ( message ) {
    if (message != null) {
        console.log(message);
        alert(message);
    }
    window.location.assign("//dmtucker.github.io/vizit/");
}


function parseQueryString ( URI ) {
    var parameters = {}
    URI.search.substr(1).split("&").forEach(
        function ( item ) {
            parameters[item.split("=")[0]] = item.split("=")[1]
        }
    )
    return parameters;
}


function loadData ( resource , type ) {
    $.getJSON("data/"+resource)
        .done(
            function ( GeoJSON ) {
                if (!isGeoJSON(GeoJSON)) problem(
                    "Error: "+resource+" must be a valid GeoJSON resource!\n" +
                    "\n" +
                    "See http://geojson.org/ for more information."
                );
                else switch (type) {
                    case "map":
                    case "spatial":
                        visualizeSpatially(GeoJSON);
                        break;
                    default:
                        var supported = [
                            "spatial"
                        ]
                        problem("Supported Visualizations: "+supported);
                }
            }
        )
        .fail(
            function ( response , error , statusText ) {
                problem(
                    (response.status == 404) ?
                        "Error: " +resource+" could not be found.":
                        "Error: " +statusText
                );
            }
        );
}


(function ( ) {
    var GET = parseQueryString(window.location);
    if (typeof GET.type === "undefined") GET.type = "spatial"
    if (GET.data) loadData(GET.data,GET.type.toLowerCase());
    else problem();
})();
