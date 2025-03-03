mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cm7c2bp3f000h01s35xhxfq26',
    center: [-98.5, 39.8],
    zoom: 3,
    minZoom: 2,
    maxZoom: 20,
    scrollZoom: true,
    dragPan: true
});

const zoomThreshold = 4;  // 设置缩放临界值

map.on('load', () => {
    map.setProjection('mercator');
    map.resize();
    
    // ✅ 强制启用所有交互（缩放、拖拽、旋转等）
    map.scrollZoom.enable();
    map.dragPan.enable();
    map.doubleClickZoom.enable();
    map.touchZoomRotate.enable();
      
    
    // **加载州级数据 (merged_data.geojson)**
    fetch('data/merged_data.geojson')
        .then(response => response.json())
        .then(stateData => {
            map.addSource('state_data', {
                type: 'geojson',
                data: stateData
            });

            // **州级填充图层 (maxzoom: 4)**
            map.addLayer({
                'id': 'state_data_layer',
                'type': 'fill',
                'source': 'state_data',
                'maxzoom': zoomThreshold,
                'paint': {
                    'fill-color': [
                        'interpolate', ['linear'], ['get', 'B25140_001E'],
                        100000, '#F2F12D',
                        500000, '#EED322',
                        1000000, '#E6B71E',
                        5000000, '#DA9C20',
                        10000000, '#CA8323'
                    ],
                    'fill-opacity': 0.75,
                    'fill-outline-color': '#ffffff'
                }
            });

            // **州级边界**
            map.addLayer({
                'id': 'state_border',
                'type': 'line',
                'source': 'state_data',
                'maxzoom': 4,  // ✅ 只有当 zoom ≤ 4 时才显示州边界
                'paint': {
                    'line-color': '#ffffff',
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        3, 0.5,   // zoom = 3 时，线宽 0.5
                        4, 1,     // zoom = 6 时，线宽 1
                    ]
                }
            });

        })
        .catch(error => console.error('Error loading state GeoJSON:', error));

    // **加载县级数据 (county_data.geojson)**
    fetch('data/county_data.geojson')
        .then(response => response.json())
        .then(countyData => {
            map.addSource('county_data', {
                type: 'geojson',
                data: countyData
            });

            // **县级填充图层 (minzoom: 4)**
            map.addLayer({
                'id': 'county_data_layer',
                'type': 'fill',
                'source': 'county_data',
                'minzoom': zoomThreshold,
                'paint': {
                    'fill-color': [
                        'interpolate', ['linear'], ['get', 'B25140_001E'],
                        10000, '#F2F12D',
                        50000, '#EED322',
                        100000, '#E6B71E',
                        500000, '#DA9C20',
                        1000000, '#CA8323'
                    ],
                    'fill-opacity': 0.75,
                    'fill-outline-color': '#ffffff'
                }
            });

            // **县级边界**
            map.addLayer({
                'id': 'county_border',
                'type': 'line',
                'source': 'county_data',
                'minzoom': 4,  // ✅ 只有当 zoom > 6 时才显示县边界
                'paint': {
                    'line-color': '#ffffff',
                    'line-width': [
                        'interpolate', ['linear'], ['zoom'],
                        4, 0.5,   // zoom = 6 时，线宽 0.5
                        10, 1,    // zoom = 10 时，线宽 1
                        14, 2     // zoom = 14 时，线宽 2
                    ]
                }
            });

        })
        .catch(error => console.error('Error loading county GeoJSON:', error));
});

// **动态图例切换**
const stateLegendEl = document.getElementById('state-legend');
const countyLegendEl = document.getElementById('county-legend');

map.on('zoom', () => {
    if (map.getZoom() > zoomThreshold) {
        stateLegendEl.style.display = 'none';
        countyLegendEl.style.display = 'block';
    } else {
        stateLegendEl.style.display = 'block';
        countyLegendEl.style.display = 'none';
    }
});
