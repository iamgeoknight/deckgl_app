// app.js
import React from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer} from '@deck.gl/geo-layers';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {BitmapLayer, PathLayer} from '@deck.gl/layers';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import accidents_jsons from "./jsons/uk_accidents.json";



const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});


// Initial View State
const INITIAL_VIEW_STATE = {
  longitude: -1.415727,
  latitude: 52.232395,
  zoom: 6.6,
  // minZoom: 5,
  // maxZoom: 15,
  pitch: 40.5,
  bearing: -27
};

function getTooltip({object}) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.points.length;

  return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    ${count} Accidents`;
}



// DeckGL react component
function App({showBorder = false, onTilesLoad = null}) {
  const layers = 
  [new TileLayer({
      // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
      data: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
    
      // Since these OSM tiles support HTTP/2, we can make many concurrent requests
      // and we aren't limited by the browser to a certain number per domain.
      maxRequests: 20,
    
      pickable: true,
      onViewportLoad: onTilesLoad,
      autoHighlight: showBorder,
      highlightColor: [60, 60, 60, 40],
      // https://wiki.openstreetmap.org/wiki/Zoom_levels
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: devicePixelRatio === 1 ? -1 : 0,
      renderSubLayers: props => {
        const {
          bbox: {west, south, east, north}
        } = props.tile;
    
        return [
          new BitmapLayer(props, {
            data: null,
            image: props.data,
            bounds: [west, south, east, north]
          }),
          showBorder &&
            new PathLayer({
              id: `${props.id}-border`,
              visible: props.visible,
              data: [
                [
                  [west, north],
                  [west, south],
                  [east, south],
                  [east, north],
                  [west, north]
                ]
              ],
              getPath: d => d,
              getColor: [255, 0, 0],
              widthMinPixels: 4
            })
        ];
      }
    }),
    new HexagonLayer({
      id: 'HexagonLayer',
      data: accidents_jsons,
      "coverage": 0.8,
      "pickable": true,
      "autoHighlight": true,
      "elevationRange": [
        0,
        3000
      ],      
      "elevationScale": 50,
      "extruded": true,
      "getPosition": d => d.COORDINATES,
      "radius": 1000,
      "upperPercentile": 100,
      "colorRange": [
        [1, 152, 189],
        [73, 227, 206],
        [216, 254, 181],
        [254, 237, 177],
        [254, 173, 84],
        [209, 55, 78]
      ],
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51]
      },
      transitions: {
        elevationScale: 3000
      }
    })
];

  console.log(layers);

  return <DeckGL
      effects={[lightingEffect]}
      mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
      >
      </DeckGL>
    ;
}

export default App;