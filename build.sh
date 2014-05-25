#!/usr/bin/env sh

GeoJSONVersion='0.1.0'
OpenFusionVersion='0.1.0'
VizitVersion='0.1.0'


minify "scripts/source/GeoJSON.js" > "scripts/geojson-$GeoJSONVersion.min.js"
minify "scripts/source/OpenFusion.js" > "scripts/openfusion-$OpenFusionVersion.min.js"

browserify "scripts/source/Vizit.js" > "scripts/vizit-$VizitVersion.js"
minify "scripts/vizit-$VizitVersion.js" > "scripts/vizit-$VizitVersion.min.js"
rm "scripts/vizit-$VizitVersion.js"
