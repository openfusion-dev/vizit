function isGeometry ( json ) {
    if (json.hasOwnProperty("type")) {
        if (json.type == "GeometryCollection") return isGeometryCollection(json);
        else return $.inArray(
            json.type,
            [
                "Point",
                "MultiPoint",
                "LineString",
                "MultiLineString",
                "Polygon",
                "MultiPolygon"
            ]
        ) > -1 && json.hasOwnProperty("coordinates");
        // TODO Validate coordinates based on type.
    }
    else return false;
}

function isGeometryCollection ( json ) {
    if (json.hasOwnProperty("type") && json.type == "GeometryCollection" &&
        json.hasOwnProperty("geometries")) {
        for (var i in json.geometries) {
            if (!isGeometry(json.geometries[i])) return false;
        }
        return true;
    }
    else return false;
}

function isFeature ( json ) {
    if (json.hasOwnProperty("type")) {
        if (json.type == "FeatureCollection") return isFeatureCollection(json); // This does not conform to GeoJSON v1.0.
        else return json.type == "Feature" &&
                    json.hasOwnProperty("geometry") && isGeometry (json.geometry) &&
                    json.hasOwnProperty("properties");
    }
    else return false;
}

function isFeatureCollection ( json ) {
    if (json.hasOwnProperty("type") && json.type == "FeatureCollection" &&
        json.hasOwnProperty("features")) {
        for (var i in json.features) {
            if (!isFeature(json.features[i])) return false;
        }
        return true;
    }
    else return false;
}

function isGeoJSON ( json ) {
    return isFeature(json) || isGeometry(json);
}
