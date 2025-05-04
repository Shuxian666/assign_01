mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm6sqlagi000001pdeydmdof6',
    center: [0, 0],
    zoom: 1.5
});

map.on('load', function () {
    map.setProjection('mercator');
    map.resize();

    let layers = map.getStyle().layers;
    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    map.addLayer({
        id: 'fat_supply_layer',
        type: 'fill',
        source: {
            type: 'geojson',
            data: 'data/fat_supply_2022_combined.geojson'  // 确保路径正确或使用 URL
        },
        paint: {
          'fill-color': [
  'step', ['get', 'Fat_per_day'],
  '#f7fcfd',        // < 34.4
  34.4, '#ccece6',
  53.5, '#a8ddb5',
  72.5, '#7bccc4',
  91.5, '#4eb3d3',
  110.6, '#2b8cbe',
  129.6, '#0868ac',
  148.6, '#084081',
  167.6, '#081d58'
],
'fill-opacity': 0.8,
'fill-outline-color': '#999'
        }
    }, firstSymbolId);
});
