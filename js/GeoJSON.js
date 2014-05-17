// TODO Validate CRS objects.
// TODO Validate bbox members.

var GeoJSON = {
    
    equalPositions: function ( a , b ) {
        // Compare two positions for equality.
        if (!GeoJSON.isPosition(a) || !GeoJSON.isPosition(b)) return false;
        if (a.length != b.length) return false;
        for (var numberi in a) {
            if (a[numberi] != b[numberi]) return false;
        }
        return true;
    },
    
    isPosition: function ( x ) {
        // Validate a GeoJSON Position geometry.
        if (!Array.isArray(x)) return false;
        if (x.length < 2) return false;
        for (var numberi in x) {
            if (typeof x[numberi] !== 'number') return false;
        }
        return true;
    },
    
    isMultiPoint: function ( x ) {
        // Validate a GeoJSON MultiPoint geometry.
        if (!Array.isArray(x)) return false;
        for (var pointi in x) {
            if (!GeoJSON.isPosition(x[pointi])) return false;
        }
        return true;
    },
    
    isLineString: function ( x ) {
        // Validate a GeoJSON LineString geometry.
        if (!Array.isArray(x)) return false;
        if (x.length < 2) return false;
        return GeoJSON.isMultiPoint(x)
    },
    
    isLinearRing: function ( x ) {
        // Validate a GeoJSON LinearRing geometry.
        if (!Array.isArray(x)) return false;
        if (x.length < 4) return false;
        if (!GeoJSON.isLineString(x)) return false;
        return GeoJSON.equalPositions(x[0],x[x.length-1]);
    },
    
    isMultiLineString: function  ( x ) {
        // Validate a GeoJSON MultiLineString geometry.
        if (!Array.isArray(x)) return false;
        for (var lineStringi in x) {
            if (!GeoJSON.isLineString(x[lineStringi])) return false;
        }
        return true;
    },
    
    isPolygon: function ( x ) {
        // Validate a GeoJSON Polygon geometry.
        if (!Array.isArray(x)) return false;
        for (var linearRingi in x) {
            if (!GeoJSON.isLinearRing(x[linearRingi])) return false;
        }
        // TODO Verify subsequent rings are contained within previous ones.
        return true;
    },
    
    isMultiPolygon: function ( x ) {
        // Validate a GeoJSON MultiPolygon geometry.
        if (!Array.isArray(x)) return false;
        for (var polygoni in x) {
            if (!GeoJSON.isPolygon(x[polygoni])) return false;
        }
        return true;
    },
    
    isGeometry: function ( x ) {
        // Validate a GeoJSON Geometry object.
        if (x == null) return false;
        if (x.type == null) return false;
        if (x.type === 'GeometryCollection') return GeoJSON.isGeometryCollection(x);
        else {
            switch (x.type) {
                case 'Point':           return GeoJSON.isPosition(x.coordinates);
                case 'MultiPoint':      return GeoJSON.isMultiPoint(x.coordinates);
                case 'LineString':      return GeoJSON.isLineString(x.coordinates);
                case 'MultiLineString': return GeoJSON.isMultiLineString(x.coordinates);
                case 'Polygon':         return GeoJSON.isPolygon(x.coordinates);
                case 'MultiPolygon':    return GeoJSON.isMultiPolygon(x.coordinates);
                default:                return false;
            }
        }
    },
    
    isGeometryCollection: function ( x ) {
        // Validate a GeoJSON GeometryCollection object.
        if (x == null) return false;
        if (x.type === 'GeometryCollection' && Array.isArray(x.geometries)) {
            for (var i in x.geometries) {
                if (!GeoJSON.isGeometry(x.geometries[i])) return false;
            }
            return true;
        }
        else return false;
    },
    
    isFeature: function ( x ) {
        // Validate a GeoJSON Feature object.
        if (x == null) return false;
        if (x.type == null) return false;
        return x.type === 'Feature' &&
               (x.geometry === null || GeoJSON.isGeometry(x.geometry)) &&
               typeof x.properties === 'object';
    },
    
    isFeatureCollection: function ( x ) {
        // Validate a GeoJSON FeatureCollection object.
        if (x == null) return false;
        if (x.type === 'FeatureCollection' && Array.isArray(x.features)) {
            for (var i in x.features) {
                if (!GeoJSON.isFeature(x.features[i])) return false;
            }
            return true;
        }
        else return false;
    },
    
    isGeoJSON: function ( x ) {
        // Validate a GeoJSON object.
        if (x == null) return false;
        return GeoJSON.isGeometry(x) ||
               GeoJSON.isFeature(x)  ||
               GeoJSON.isFeatureCollection(x);
    },
    
    mapFeatures: function ( geojson , FeatureCallback ) {
        // Apply a function to GeoJSON Feature objects.
        if (typeof FeatureCallback === 'function') {
            if (GeoJSON.isFeatureCollection(geojson)) {
                var features = geojson.features;
                for (var featurei in features) {
                    var feature = geojson.features[featurei];
                    FeatureCallback(feature);
                }
            }
            else if (GeoJSON.isFeature(geojson)) FeatureCallback(geojson);
        }
    }
};
