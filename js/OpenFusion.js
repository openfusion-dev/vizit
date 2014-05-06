function OpenFusionError ( name ) {
    var message;
    switch (name) {
        case "malformed":
            message = "The specified OpenFusion GeoJSON is malformed.";
            break;
        case "unsupported":
            message = "Only OpenFusion v3 and above is supported";
            break;
        default:
            message = "A problem occurred in the OpenFusion preprocessor.";
    }
    console.log(message);
}


function preprocessOpenFusionSpatially ( GeoJSON ) {
    var OpenFusionCircleMarkerOptions = {
        stroke: true,
        color: "#000",
        weight: 4,
        opacity: 1.0,
        fill: true,
        fillColor: "#5Af",
        fillOpacity: 0.8,
        dashArray: null,
        lineCap: null,
        lineJoin: null,
        clickable: true,
        pointerEvents: null,
        className: "",
        radius: 8  // This Path Option is specific to CircleMarkers.
    }
    switch (GeoJSON.OpenFusion) {
        case "1":
        case "2":
            OpenFusionError("unsupported");
            break;
        default:
        case "3":
        case "4":
        case "5":
            if (isFeatureCollection(GeoJSON)) {
                var epicenters = GeoJSON.features;
                for (var epicenteri in epicenters) {
                    var epicenter = GeoJSON.features[epicenteri];
                    if (typeof epicenter.properties.related == "undefined") continue;
                    if (isFeatureCollection(epicenter.properties.related)) {
                        var aftershocks = epicenter.properties.related;
                        for (var aftershocki in aftershocks.features) {
                            var aftershock = aftershocks.features[aftershocki];
                            var properties = aftershock.properties;
                            properties.marker = "CircleMarker";
                            properties.markerOptions = JSON.parse(
                                JSON.stringify(OpenFusionCircleMarkerOptions)
                            );  // This is necessary to create a copy.
                            if (typeof properties.image === "string") {
                                properties.markerOptions.fillColor = "#E79";
                            }
                        }
                    }
                    else OpenFusionError("malformed");
                }
            }
            else OpenFusionError("malformed");
    }
    return GeoJSON;
}
