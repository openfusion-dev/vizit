OpenFusion GeoJSON Visualizer
=============================

Vizit creates mobile-friendly visualizations for geotagged data using HTML5 and CSS3.
It retrieves GeoJSON files via AJAX and produces maps using Leaflet.js and OpenStreetMap.
See the [documentation](//ogre.readthedocs.org/en/latest/about.html) of OGRe, a complemental project, for more on the history and architecture of vizit.

[![Screenshot](https://dmtucker.github.io/vizit/images/screenshot.png)](https://dmtucker.github.io/vizit/)

# The Basics
Follow this simple guide to quickly get started using Vizit.

## Installation
To get Vizit, use one of the following methods:

1. [GitHub](https://github.com/dmtucker/vizit/archive/master.zip) (recommended)
2. git
```shell
$ git clone http://github.com/dmtucker/vizit.git
```

## Usage
To use Vizit, you must open `index.html` in your favorite browser.

#### Note
> Development and testing is done in the latest version of Google Chrome, but Vizit uses HTML5 Boilerplate, Twitter Bootstrap, Modernizr, and more to accommodate as many devices and browsers as possible.

GeoJSON data is specified as a GET parameter like so: `/index.html?data=example.geojson`

***

# Advanced Features
Vizit looks for keywords in the properties of Feature objects. These keywords affect the look of the resulting visualization. Each property is listed alphabetically below.

* `image` -- content to be displayed in a popup ([Base64](http://en.wikipedia.org/wiki/Base64)-encoded string)
* `marker` -- string signifying what type of marker to create (`"Marker"` and `"CircleMarker"` are currently supported.)
* `markerOptions` -- object containing [Leaflet Marker Options](http://leafletjs.com/reference.html#marker-options) or [Leaflet Path Options](http://leafletjs.com/reference.html#path-options) for styling the [Marker](http://leafletjs.com/reference.html#marker) or [CircleMarker](http://leafletjs.com/reference.html#circlemarker) object, respectively, that represents the Feature (depending on the value of `marker`)
* `radius` -- floating point number representing an area around the Feature's Geometry (in meters)
* `radiusOptions` -- object containing [Leaflet Path Options](http://leafletjs.com/reference.html#path-options) for styling the [circle](http://leafletjs.com/reference.html#circle) that represents the radius (`radiusOptions` are only rendered if `radius` is specified.)
* `related` -- GeoJSON FeatureCollection of locally-related data
* `source` -- origin of `text` and `image` content 
* `text` -- string to be displayed in a popup (Unicode encoding supported)
* `time` -- string produced by `JSON.stringify()` ([ISO 8601](http://en.wikipedia.org/wiki/ISO_8601) format)

***

## License

Copyright (C) 2016 David Tucker

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
