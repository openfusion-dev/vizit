#!/usr/bin/env sh

OpenFusionVersion='0.1.0'
VizitVersion='0.1.0'

browserify "scripts/source/OpenFusion.js" > "scripts/openfusion-$OpenFusionVersion.js"
minify "scripts/openfusion-$OpenFusionVersion.js" > "scripts/openfusion-$OpenFusionVersion.min.js"
rm "scripts/openfusion-$OpenFusionVersion.js"

browserify "scripts/source/Vizit.js" > "scripts/vizit-$VizitVersion.js"
minify "scripts/vizit-$VizitVersion.js" > "scripts/vizit-$VizitVersion.min.js"
rm "scripts/vizit-$VizitVersion.js"
