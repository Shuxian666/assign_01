mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ'; 

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm7c2bp3f000h01s35xhxfq26',
    zoom: 10,
    center: [-73.9, 40.7],
    maxZoom: 14,
    minZoom: 6,
    maxBounds: [[-75, 39.5], [-71.5, 41.5]]
});

map.on('load', function () {
    map.setProjection('equalEarth'); // 2D 视角
    map.resize(); // 确保地图填充

    // 加载 Equal Count 数据
    map.addSource('equal_count', {
        type: 'geojson',
        data: 'data/equal_count.geojson'
    });

    // 添加 Equal Count 图层
    map.addLayer({
        'id': 'equal_count_layer',
        'type': 'fill',
        'source': 'equal_count',
        'paint': {
            'fill-color': [
                'step', ['get', 'equal_count'],
                '#f7fcfd', 0,  // 最低分组
                '#ccece6', 1,  // 第二分组
                '#66c2a4', 2,  // 第三分组
                '#238b45', 3,  // 第四分组
                '#005824'     // 最高分组
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#000'
        }
    });
});

var toggleableLayerIds = ['equal_count_layer'];


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
    