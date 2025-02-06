mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm6sqlagi000001pdeydmdof6',
    center: [-74, 40.725], // 纽约市
    zoom: 12 // 缩放级别
});
map.on('load', function () {
    map.setProjection('mercator'); // 强制 2D 视角
    map.resize(); // 确保地图填充
});