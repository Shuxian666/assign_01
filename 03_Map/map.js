mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm7c46j19000w01s36f014w7f',
    zoom: 10,
    center: [-73.9, 40.7],
    maxZoom: 14,
    minZoom: 6,
    maxBounds: [[-75, 39.5], [-71.5, 41.5]]
});

map.on('load', function () {
    map.setProjection('naturalEarth'); // 2D 视角
    map.resize(); // 确保地图填充

    // 加载 Natural Breaks 数据
    map.addSource('natural_breaks', {
        type: 'geojson',
        data: 'data/natural_breaks.geojson'
    });

    // 添加 Natural Breaks 图层
    map.addLayer({
        'id': 'natural_breaks_layer',
        'type': 'fill',
        'source': 'natural_breaks',
        'paint': {
            'fill-color': [
                'step', ['get', 'natural_breaks'],
                '#f7fcfd', 0,  // 最低组
                '#ccece6', 1,  // 第二组
                '#66c2a4', 2,  // 第三组
                '#238b45', 3,  // 第四组
                '#005824'     // 最高组
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#000'
        }
    });
});

var toggleableLayerIds = ['natural_breaks_layer'];


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
    