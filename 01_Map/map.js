mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm6sqlagi000001pdeydmdof6',
    zoom: 10,
    center: [-73.9, 40.7],
    maxZoom: 14,
    minZoom: 6,
    maxBounds: [[-75, 39.5], [-71.5, 41.5]]
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
    
        // 加载 Natural Breaks 数据
        map.addSource('equal_intervals', {
            type: 'geojson',
            data: 'data/equal_intervals.geojson'
        });
    
        // 添加 Natural Breaks 图层
        map.addLayer({
            'id': 'equal_intervals_layer',
            'type': 'fill',
            'source': 'equal_intervals',
            'paint': {
                'fill-color': [
                    'step', ['get', 'equal_intervals'],
                    '#f7fcfd', 0,  // 最低组
                    '#ccece6', 1,  // 第二组
                    '#66c2a4', 2,  // 第三组
                    '#238b45', 3,  // 第四组
                    '#005824'     // 最高组
                ],
                'fill-opacity': 0.7,
                'fill-outline-color': '#000'
            }
        }, 'libraryLayer');
    });

    var toggleableLayerIds = ['equal_intervals_layer'];


for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}
    
