mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm6sqlagi000001pdeydmdof6',
    center: [0, 0],
    zoom: 1.5
});

map.on('load', function () {
    map.setProjection('equalEarth');
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
  '#f7fcfd',        // <49.2
  49.2, '#ccece6',
  58.9, '#a8ddb5',
  69.6, '#7bccc4',
  83.3, '#4eb3d3',
  100.8, '#2b8cbe',
  112.6, '#0868ac',
  125.9, '#084081',
  141.8, '#081d58'
],
'fill-opacity': 0.8,
'fill-outline-color': '#999'
        }
    }, firstSymbolId);
});
