// TODO Validate CRS objects.
// TODO Validate bbox members.


function equalPositions ( a , b ) {
    // Compare two positions for equality.
    if (!isPosition(a) || !isPosition(b)) return false;
    if (a.length != b.length) return false;
    for (var numberi in a) {
        if (a[numberi] != b[numberi]) return false;
    }
    return true;
}


function isPosition ( x ) {
    // Validate a GeoJSON Position geometry.
    if (!Array.isArray(x)) return false;
    if (x.length < 2) return false;
    for (var numberi in x) {
        if (typeof x[numberi] !== 'number') return false;
    }
    return true;
}


function isMultiPoint ( x ) {
    // Validate a GeoJSON MultiPoint geometry.
    if (!Array.isArray(x)) return false;
    for (var pointi in x) {
        if (!isPosition(x[pointi])) return false;
    }
    return true;
}


function isLineString ( x ) {
    // Validate a GeoJSON LineString geometry.
    if (!Array.isArray(x)) return false;
    if (x.length < 2) return false;
    return isMultiPoint(x)
}


function isLinearRing ( x ) {
    // Validate a GeoJSON LinearRing geometry.
    if (!Array.isArray(x)) return false;
    if (x.length < 4) return false;
    if (!isLineString(x)) return false;
    return equalPositions(x[0],x[x.length-1]);
}


function isMultiLineString ( x ) {
    // Validate a GeoJSON MultiLineString geometry.
    if (!Array.isArray(x)) return false;
    for (var lineStringi in x) {
        if (!isLineString(x[lineStringi])) return false;
    }
    return true;
}


function isPolygon ( x ) {
    // Validate a GeoJSON Polygon geometry.
    if (!Array.isArray(x)) return false;
    for (var linearRingi in x) {
        if (!isLinearRing(x[linearRingi])) return false;
    }
    // TODO Verify subsequent rings are contained within previous ones.
    return true;
}


function isMultiPolygon ( x ) {
    // Validate a GeoJSON MultiPolygon geometry.
    if (!Array.isArray(x)) return false;
    for (var polygoni in x) {
        if (!isPolygon(x[polygoni])) return false;
    }
    return true;
}


function isGeometry ( x ) {
    // Validate a GeoJSON Geometry object.
    if (x == null) return false;
    if (x.type == null) return false;
    if (x.type === 'GeometryCollection') return isGeometryCollection(x);
    else {
        switch (x.type) {
            case 'Point':           return isPosition(x.coordinates);
            case 'MultiPoint':      return isMultiPoint(x.coordinates);
            case 'LineString':      return isLineString(x.coordinates);
            case 'MultiLineString': return isMultiLineString(x.coordinates);
            case 'Polygon':         return isPolygon(x.coordinates);
            case 'MultiPolygon':    return isMultiPolygon(x.coordinates);
            default:                return false;
        }
    }
}


function isGeometryCollection ( x ) {
    // Validate a GeoJSON GeometryCollection object.
    if (x == null) return false;
    if (x.type === 'GeometryCollection' && Array.isArray(x.geometries)) {
        for (var i in x.geometries) {
            if (!isGeometry(x.geometries[i])) return false;
        }
        return true;
    }
    else return false;
}


function isFeature ( x ) {
    // Validate a GeoJSON Feature object.
    if (x == null) return false;
    if (x.type == null) return false;
    return x.type === 'Feature' &&
           (x.geometry === null || isGeometry(x.geometry)) &&
           typeof x.properties === 'object';
}


function isFeatureCollection ( x ) {
    // Validate a GeoJSON FeatureCollection object.
    if (x == null) return false;
    if (x.type === 'FeatureCollection' && Array.isArray(x.features)) {
        for (var i in x.features) {
            if (!isFeature(x.features[i])) return false;
        }
        return true;
    }
    else return false;
}


function isGeoJSON ( x ) {
    // Validate a GeoJSON object.
    if (x == null) return false;
    return isGeometry(x) ||
           isFeature(x)  ||
           isFeatureCollection(x);
}


function mapFeatures ( GeoJSON , FeatureCallback ) {
    // Apply a function to GeoJSON Feature objects.
    if (typeof FeatureCallback === 'function') {
        if (isFeatureCollection(GeoJSON)) {
            var features = GeoJSON.features;
            for (var featurei in features) {
                var feature = GeoJSON.features[featurei];
                FeatureCallback(feature);
            }
        }
        else if (isFeature(GeoJSON)) FeatureCallback(GeoJSON);
    }
}
