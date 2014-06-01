#!/usr/bin/env sh

GeoJSONVersion='0.1.0'
OpenFusionVersion='0.1.0'
VizitVersion='0.1.0'


browserify "scripts/source/GeoJSON.js" > "scripts/geojson-$GeoJSONVersion.js"
minify "scripts/geojson-$GeoJSONVersion.js" > "scripts/geojson-$GeoJSONVersion.min.js"
rm "scripts/geojson-$GeoJSONVersion.js"

browserify "scripts/source/OpenFusion.js" > "scripts/geojson-$OpenFusionVersion.js"
minify "scripts/geojson-$OpenFusionVersion.js" > "scripts/openfusion-$OpenFusionVersion.min.js"
rm "scripts/geojson-$OpenFusionVersion.js"

browserify "scripts/source/Vizit.js" > "scripts/vizit-$VizitVersion.js"
minify "scripts/vizit-$VizitVersion.js" > "scripts/vizit-$VizitVersion.min.js"
rm "scripts/vizit-$VizitVersion.js"
