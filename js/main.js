function problem ( message ) {
    if (message != null) {
        console.log(message);
        alert(message);
    }
    window.location.assign("http://dmtucker.github.io/vizit/");
    //throw new Error(message); // This prevents further execution after redirecting.
}


function parseQueryString ( uri ) {
    var parameters = {}
    uri.search.substr(1).split("&").forEach(
        function ( item ) {
            parameters[item.split("=")[0]] = item.split("=")[1]
        }
    )
    return parameters;
}


function loadData ( type , file ) {
    $.getJSON("data/"+file)
        .done(function ( GeoJSON ) {
            if (!isGeoJSON(GeoJSON)) problem(
                "Error: "+file+" must be a valid GeoJSON file!\n" +
                "\n" +
                "See http://geojson.org/ for more information."
            );
            else switch (type) {
                case "map":
                case "spatial":
                    visualizeSpatially(GeoJSON);
                    break;
                default:
                    problem('Only "spatial" visualizations are supported.');
            }
        })
        .fail(function ( response , error , statusText ) {
            problem(
                (response.status === 404) ?
                    "Error: " +file+" could not be found.":
                    "Error: " +statusText
            );
        })
}


var  GET = parseQueryString(window.location);
if (!GET.type) GET.type = "spatial"
if ( GET.data) loadData(GET.type.toLowerCase(),GET.data);
else problem();
