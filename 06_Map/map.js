mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/guodongdong/cmdeikmhz010v01sa17e9dmz7',
    center: [-73.935242, 40.801330], // East Harlem
    zoom: 13
});

map.on('load', () => {
    // 加载 GeoJSON 数据
    map.addSource('gardens', {
        type: 'geojson',
        data: 'data/Community_Gardens.geojson'  // 确保路径正确
    });

    // 显示为 circle 点位
    map.addLayer({
        id: 'gardens-layer',
        type: 'circle',
        source: 'gardens',
        paint: {
            'circle-radius': 6,
            'circle-color': '#17c3b2',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });

    // 添加鼠标点击显示 popup
    map.on('click', 'gardens-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;
    
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <strong>${props.name}</strong><br/>
                ${props.address || ''}<br/>
                Type: ${props.type || 'N/A'}
            `)
            .addTo(map);
    });    

    // 鼠标样式
    map.on('mouseenter', 'gardens-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'gardens-layer', () => {
        map.getCanvas().style.cursor = '';
    });

    map.addSource('education', {
        type: 'geojson',
        data: 'data/Education_Systems.geojson'
    });
    
    map.addLayer({
        id: 'education-layer',
        type: 'circle',
        source: 'education',
        paint: {
            'circle-radius': 5,
            'circle-color': '#fe6d73',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
    map.on('click', (e) => {
        const lon = e.lngLat.lng;
        const lat = e.lngLat.lat;
    
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${lon},${lat}?contours_minutes=5&polygons=true&access_token=${mapboxgl.accessToken}`;
    
        fetch(url)
            .then(res => res.json())
            .then(data => {
                // 如果已有等时圈图层，则更新数据
                if (map.getSource('isochrone')) {
                    map.getSource('isochrone').setData(data);
                } else {
                    map.addSource('isochrone', {
                        type: 'geojson',
                        data: data
                    });
    
                    map.addLayer({
                        id: 'isochrone-layer',
                        type: 'fill',
                        source: 'isochrone',
                        paint: {
                            'fill-color': '#ffcb77',
                            'fill-opacity': 0.5
                        }
                    });
                }
            })
            .catch(err => {
                console.error('Isochrone API error:', err);
            });
    });    
    
    
});
