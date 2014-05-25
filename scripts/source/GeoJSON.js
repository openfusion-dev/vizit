// TODO Validate CRS objects.
// TODO Validate bbox members.

var GeoJSON = {
    
    
    version: '0.1.0',
    
    
    equalPositions: function ( a , b ) {
        // Compare two positions for equality.
        return (
            GeoJSON.isPosition(a) && GeoJSON.isPosition(b) &&
            a.length == b.length &&
            a.every(
                function ( element , index ) {
                    return (a[index] == b[index]);
                }
            )
        );
    },
    
    
    isPosition: function ( x ) {
        // Validate a GeoJSON Position geometry.
        return (
            Array.isArray(x) &&
            x.length > 1 &&
            x.every(
                function ( element ) {
                    return (typeof element === 'number');
                }
            )
        );
    },
    
    
    isMultiPoint: function ( x ) {
        // Validate a GeoJSON MultiPoint geometry.
        return (Array.isArray(x) && x.every(GeoJSON.isPosition));
    },
    
    
    isLineString: function ( x ) {
        // Validate a GeoJSON LineString geometry.
        return (Array.isArray(x) && x.length > 1 && GeoJSON.isMultiPoint(x));
    },
    
    
    isLinearRing: function ( x ) {
        // Validate a GeoJSON LinearRing geometry.
        return (
            Array.isArray(x) &&
            x.length > 3 &&
            GeoJSON.isLineString(x) &&
            GeoJSON.equalPositions(x[0],x[x.length-1])
        );
    },
    
    
    isMultiLineString: function  ( x ) {
        // Validate a GeoJSON MultiLineString geometry.
        return (Array.isArray(x) && x.every(GeoJSON.isLineString));
    },
    
    
    isPolygon: function ( x ) {
        // Validate a GeoJSON Polygon geometry.
        return (Array.isArray(x) && x.every(GeoJSON.isLinearRing));
        // TODO Verify subsequent rings are contained within previous ones.
    },
    
    
    isMultiPolygon: function ( x ) {
        // Validate a GeoJSON MultiPolygon geometry.
        return (Array.isArray(x) && x.every(GeoJSON.isPolygon));
    },
    
    
    isGeometry: function ( x ) {
        // Validate a GeoJSON Geometry object.
        if (x == null) return false;
        switch (x.type) {
            case 'Point':
                return GeoJSON.isPosition(x.coordinates);
            case 'MultiPoint':
                return GeoJSON.isMultiPoint(x.coordinates);
            case 'LineString':
                return GeoJSON.isLineString(x.coordinates);
            case 'MultiLineString':
                return GeoJSON.isMultiLineString(x.coordinates);
            case 'Polygon':
                return GeoJSON.isPolygon(x.coordinates);
            case 'MultiPolygon':
                return GeoJSON.isMultiPolygon(x.coordinates);
            case 'GeometryCollection':
                return GeoJSON.isGeometryCollection(x);
            default:
                return false;
        }
    },
    
    
    isGeometryCollection: function ( x ) {
        // Validate a GeoJSON GeometryCollection object.
        return (
            x != null &&
            x.type === 'GeometryCollection' &&
            Array.isArray(x.geometries) &&
            x.geometries.every(GeoJSON.isGeometry)
        );
    },
    
    
    isFeature: function ( x ) {
        // Validate a GeoJSON Feature object.
        return (
            x != null &&
            x.type === 'Feature' &&
            (x.geometry === null || GeoJSON.isGeometry(x.geometry)) &&
            typeof x.properties === 'object'
        );
    },
    
    
    isFeatureCollection: function ( x ) {
        // Validate a GeoJSON FeatureCollection object.
        return (
            x != null &&
            x.type === 'FeatureCollection' &&
            Array.isArray(x.features) &&
            x.features.every(GeoJSON.isFeature)
        );
    },
    
    
    isGeoJSON: function ( x ) {
        // Validate a GeoJSON object.
        return (
            GeoJSON.isGeometry(x) ||
            GeoJSON.isFeature(x)  ||
            GeoJSON.isFeatureCollection(x)
        );
    },
    
    
    isEmptyFeature: function ( x ) {
        return (
            GeoJSON.isFeature(x) &&
            x.geometry == null &&
            x.properties == null
        );
    },
    
    
    isEmptyFeatureCollection: function ( x ) {
        return (
            GeoJSON.isFeatureCollection(x) &&
            (
                x.features.length == 0 ||
                x.features.every(GeoJSON.isEmptyFeature)
            )
        );
    },
    
    
    isEmptyGeometryCollection: function ( x ) {
        return (
            GeoJSON.isGeometryCollection(x) &&
            x.geometries.length == 0
        );
    },
    
    
    isEmpty: function ( x ) {
        // Validate an empty GeoJSON object.
        return (
            GeoJSON.isEmptyFeature(x) ||
            GeoJSON.isEmptyFeatureCollection(x) ||
            GeoJSON.isEmptyGeometryCollection(x)
        );
    },
    
    
// TODO ///////////////////////////////////////////////////////////////////// 80
    mapFeatures: function ( geojson , FeatureCallback ) {
        // Apply a function to GeoJSON Feature objects.
        if (typeof FeatureCallback === 'function') {
            if (GeoJSON.isFeatureCollection(geojson)) {
                geojson.features.forEach(FeatureCallback);
            }
            else if (GeoJSON.isFeature(geojson)) FeatureCallback(geojson);
        }
    }
// TODO ///////////////////////////////////////////////////////////////////// 80
};
