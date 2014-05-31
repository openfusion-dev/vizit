// TODO Validate CRS objects.
// TODO Validate bbox members.

var GeoJSON = {
    
    
    // Versions below 1.0.0 cannot validate the entire GeoJSON specification.
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
        // Validate an empty GeoJSON Feature.
        return (
            GeoJSON.isFeature(x) &&
            x.geometry === null &&
            x.properties === {}
        );
    },
    
    
    isEmptyFeatureCollection: function ( x ) {
        // Validate an empty GeoJSON FeatureCollection.
        return (
            GeoJSON.isFeatureCollection(x) &&
            (
                x.features.length == 0 ||
                x.features.every(GeoJSON.isEmptyFeature)
            )
        );
    },
    
    
    isEmptyGeometryCollection: function ( x ) {
        // Validte an empty GeoJSON GeometryCollection.
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
    
    
    Point: function ( latitude , longitude , altitude ) {
        // Create a valid GeoJSON Point geometry.
        var Point = null;
        if (typeof longitude === 'number' && typeof latitude === 'number') {
            Point = {
                type: 'Point',
                coordinates: [longitude,latitude]
            };
            if (typeof altitude === 'number') Point.coordinates.push(altitude);
        }
        return Point;
    },
    
    
    Feature: function ( geometry , properties ) {
        // Create a valid GeoJSON Feature.
        var Feature = {
            type: 'Feature',
            geometry: null,
            properties: (typeof properties === 'object') ? properties : {}
        };
        if (GeoJSON.isGeometry(geometry)) Feature.geometry = geometry;
        return Feature;
    },
    
    
    FeatureCollection: function ( Features ) {
        // Create a valid GeoJSON FeatureCollection.
        var FeatureCollection = {
            type: 'FeatureCollection',
            features: []
        };
        if (GeoJSON.isFeature(Features)) {
            FeatureCollection.features.push(Features);
        }
        else if (Array.isArray(Features)) Features.forEach(
            function ( Feature ) {
                if (GeoJSON.isFeature(Feature)) {
                    FeatureCollection.features.push(Feature);
                }
            }
        );
        return FeatureCollection;
    },
    
    
    GeometryCollection: function ( Geometries ) {
        // Create a valid GeoJSON GeometryCollection.
        var GeometryCollection = {
            type: 'GeometryCollection',
            geometries: []
        };
        if (GeoJSON.isGeometry(Geometries)) {
            GeometryCollection.geometries.push(Geometries);
        }
        else if (Array.isArray(Geometries)) Geometries.forEach(
            function ( Geometry ) {
                if (GeoJSON.isGeometry(Geometry)) {
                    GeometryCollection.geometries.push(Geometry);
                }
            }
        );
        return GeometryCollection;
    },
    
    
    features: function ( geojson ) {
        // Find all features in a GeoJSON object.
        var features = [];
        if (GeoJSON.isFeatureCollection(geojson)) geojson.features.forEach(
            function ( Feature ) {
                GeoJSON.features(Feature).forEach(
                    function ( Feature ) {
                        features.push(Feature);
                    }
                );
            }
        );
        else if (GeoJSON.isFeature(geojson)) features.push(geojson);
        return features;
    },
    
    
    geometries: function ( geojson ) {
        // Find all geometries in a GeoJSON object.
        var geometries = [];
        if (GeoJSON.isGeometryCollection(geojson)) geojson.geometries.forEach(
            function ( Geometry ) {
                GeoJSON.geometries(Geometry).forEach(
                    function ( Geometry ) {
                        geometries.push(Geometry);
                    }
                );
            }
        );
        else if (GeoJSON.isGeometry(geojson)) geometries.push(geojson);
        // TODO Extract geometries from Features!
        return geometries;
    }
    
    
};
