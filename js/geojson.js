// TODO Validate CRS objects.
// TODO Validate bbox members.


function equalPositions ( a , b ) {
    if (!isPosition(a) || !isPosition(b)) return false;
    if (a.length != b.length) return false;
    for (var numberi in a) {
        if (a[numberi] != b[numberi]) return false;
    }
    return true;
}


function isPosition ( x ) {
    if (!Array.isArray(x)) return false;
    for (var numberi in x) {
        if (typeof x[numberi] !== "number") return false;
    }
    return true;
}


function isMultiPoint ( x ) {
    if (!Array.isArray(x)) return false;
    for (var pointi in x) {
        if (!isPosition(x[pointi])) return false;
    }
    return true;
}


function isLineString ( x ) {
    if (!Array.isArray(x)) return false;
    if (x.length < 2) return false;
    return isMultiPoint(x)
}


function isLinearRing ( x ) {
    if (!Array.isArray(x)) return false;
    if (x.length < 4) return false;
    if (!isLineString(x)) return false;
    return equalPositions(x[0],x[x.length-1]);
}


function isMultiLineString ( x ) {
    if (!Array.isArray(x)) return false;
    for (var lineStringi in x) {
        if (!isLineString(x[lineStringi])) return false;
    }
    return true;
}


function isPolygon ( x ) {
    if (!Array.isArray(x)) return false;
    for (var linearRingi in x) {
        if (!isLinearRing(x[linearRingi])) return false;
    }
    // TODO Verify subsequent rings are contained within previous ones.
    return true;
}


function isMultiPolygon ( x ) {
    if (!Array.isArray(x)) return false;
    for (var polygoni in x) {
        if (!isPolygon(x[polygoni])) return false;
    }
    return true;
}


function isGeometry ( x ) {
    if (x == null) return false;
    if (x.type == null) return false;
    if (x.type === "GeometryCollection") return isGeometryCollection(x);
    else {
        switch (x.type) {
            case "Point":           return isPosition(x.coordinates);
            case "MultiPoint":      return isMultiPoint(x.coordinates);
            case "LineString":      return isLineString(x.coordinates);
            case "MultiLineString": return isMultiLineString(x.coordinates);
            case "Polygon":         return isPolygon(x.coordinates);
            case "MultiPolygon":    return isMultiPolygon(x.coordinates);
            default:                return false;
        }
    }
}


function isGeometryCollection ( x ) {
    if (x == null) return false;
    if (x.type === "GeometryCollection" && Array.isArray(x.geometries)) {
        for (var i in x.geometries) {
            if (!isGeometry(x.geometries[i])) return false;
        }
        return true;
    }
    else return false;
}


function isFeature ( x ) {
    if (x == null) return false;
    if (x.type == null) return false;
    return x.type === "Feature" &&
           (x.geometry === null || isGeometry(x.geometry)) &&
           typeof x.properties === "object";
}


function isFeatureCollection ( x ) {
    if (x == null) return false;
    if (x.type === "FeatureCollection" && Array.isArray(x.features)) {
        for (var i in x.features) {
            if (!isFeature(x.features[i])) return false;
        }
        return true;
    }
    else return false;
}


function isGeoJSON ( x ) {
    if (x == null) return false;
    return isGeometry(x) ||
           isFeature(x)  ||
           isFeatureCollection(x);
}
