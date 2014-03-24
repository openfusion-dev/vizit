function OpenFusionPreprocessor ( GeoJSON ) {
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
        default:
            if (isFeatureCollection(GeoJSON)) {
                for (var featurei in GeoJSON.features) {
                    var epicenter = GeoJSON.features[featurei];
                    if (isFeatureCollection(epicenter.properties.related)) {
                        for (var relatedi in epicenter.properties.related.features) {
                            var feature = epicenter.properties.related.features[relatedi];
                            feature.properties.marker = "CircleMarker";
                            feature.properties.markerOptions = OpenFusionCircleMarkerOptions; 
                            if (typeof feature.properties.image === "string") {
                                feature.properties.markerOptions.fillColor = "#E79";
                            }
                        }
                    }
                }
            }
            else console.log("The specified GeoJSON file is not compatible with OpenFusion.");
    }
    return GeoJSON;
}
