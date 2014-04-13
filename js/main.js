function problem ( message ) {
    console.log(message);
    alert(message);
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
        .done(function ( GeoJSON ) {  // TODO Consider validating in the visulization modules.
            if (!isGeoJSON(GeoJSON)) problem(
                "Error: "+file+" must be a valid GeoJSON file!\n" +
                "\n" +
                "See http://geojson.org/ for more information."
            );
            switch (type) {
                case "map":
                case "spatial":
                    visualizeSpatially(GeoJSON);
                    break;
                case "timeline":
                case "temporal":
                    visualizeTemporally(GeoJSON);
                    break;
                default:
                    problem('Only "spatial" and "temporal" visualizations are supported.');
                    // TODO Redirect to or create (preferably the latter) a landing page.
            }
        })
        .fail(function ( response , error , statusText ) {
            problem(
                "Error: " +statusText
            );
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
else {
    // TODO Redirect to or create (preferably the latter) a landing page.
    alert("Welcome to Vizit!");
}
