function isGeometry ( json ) {
    if (json == null) return false;
    if (json.type == null) return false;
    if (json.type === "GeometryCollection") return isGeometryCollection(json);
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
    ) > -1 && Array.isArray(json.coordinates);
    // TODO Validate coordinates based on type.
}

function isGeometryCollection ( json ) {
    if (json == null) return false;
    if (json.type === "GeometryCollection" && Array.isArray(json.geometries)) {
        for (var i in json.geometries) {
            if (!isGeometry(json.geometries[i])) return false;
        }
        return true;
    }
    else return false;
}

function isFeature ( json ) {
    if (json == null) return false;
    if (json.type == null) return false;
    //if (json.type === "FeatureCollection") return isFeatureCollection(json); // This does not conform to GeoJSON v1.0.
    return json.type === "Feature" &&
           isGeometry (json.geometry) &&
           typeof json.properties === "object";
}

function isFeatureCollection ( json ) {
    if (json == null) return false;
    if (json.type === "FeatureCollection" && Array.isArray(json.features)) {
        for (var i in json.features) {
            if (!isFeature(json.features[i])) return false;
        }
        return true;
    }
    else return false;
}

function isGeoJSON ( json ) {
    if (json == null) return false;
    return isGeometry(json) ||
           isFeature(json)  ||
           isFeatureCollection(json);
}
