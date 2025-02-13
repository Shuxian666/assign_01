mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm6sqlagi000001pdeydmdof6',
    center: [-73.9, 40.7], // 纽约皇后区
    zoom: 11 // 适合展示图书馆的缩放级别
});

map.on('load', function () {
    map.setProjection('mercator'); // 2D 视角
    map.resize(); // 确保地图填充

    let layers = map.getStyle().layers;
    let firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    // 添加图书馆数据层
    map.addSource('libraryData', {
        'type': 'geojson',
        'data': 'data/LIBRARY_20250213.geojson'
    });

    map.addLayer({
        'id': 'libraryLayer',
        'type': 'circle',
        'source': 'libraryData',
        'paint': {
            'circle-color': ['match', ['get', 'CITY'],
                'New York', '#ff5733',  // 纽约红色
                '#4287f5' // 其他区域蓝色
            ],
            'circle-stroke-color': '#333',
            'circle-stroke-width': 1,
            'circle-radius': ['interpolate', ['exponential', 2], ['zoom'],
                10, 5,
                15, 12
            ],
        }
    }, firstSymbolId);

    // 添加人口密度地图 (Census Tracts)
    map.addSource('censusData', {
        'type': 'geojson',
        'data': 'data/2020_Census_Tracts_manual.geojson'
    });

    map.addLayer({
        'id': 'censusLayer',
        'type': 'fill',
        'source': 'censusData',
        'layout': {},
        'paint': {
            'fill-color': [
                'interpolate',
                ['linear'], ['get', 'Shape_Area'],
                1000000, '#00441b',  // 最小区域（高密度）→ 深绿色
                2000000, '#006d2c',  
                3000000, '#238b45',  
                5000000, '#41ae76',  
                10000000, '#99d8c9'  // 最大区域（低密度）→ 浅绿色
            ],
            'fill-opacity': 0.5,  // 透明度 50%
            'fill-outline-color': '#004d4d'  // 深绿色边界
        }
    }, 'libraryLayer'); // 让 Census Layer 位于 Library Layer 之下
});
