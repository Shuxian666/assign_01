// Set Mapbox token and initialize the map
mapboxgl.accessToken = 'pk.eyJ1IjoiZ3VvZG9uZ2RvbmciLCJhIjoiY20xZjYwN2xsMW4zeDJqcHBkbDlzam8yeCJ9.wZeYNDrxRmkwQqEnail5XQ';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/guodongdong/cmdeikmhz010v01sa17e9dmz7',
  center: [-73.935242, 40.801330],
  zoom: 13
});

let allFeatures = [];
let isochronePolygon = null;
let selectedTime = new Date();

function getFeatureName(f) {
  return f.properties.name || f.properties["name of institution"] || "Unnamed";
}

map.on('load', () => {
  map.addSource('gardens', {
    type: 'geojson',
    data: 'data/Community_Gardens.geojson'
  });

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

  map.on('click', 'gardens-layer', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const props = e.features[0].properties;
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <strong>${getFeatureName({ properties: props })}</strong><br/>
        ${props.address || ''}<br/>
        Type: ${props.type || 'N/A'}
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'gardens-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'gardens-layer', () => {
    map.getCanvas().style.cursor = '';
  });

  map.addSource('education', {
    type: 'geojson',
    data: 'data/Education_Systems_2.geojson'
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

  map.loadImage('data/01.png', function (error, image1) {
    if (error) throw error;
    if (!map.hasImage('garden-icon')) {
      map.addImage('garden-icon', image1);
    }
  
    map.loadImage('data/02.png', function (error, image2) {
      if (error) throw error;
      if (!map.hasImage('edu-icon')) {
        map.addImage('edu-icon', image2);
      }

    map.addSource('highlighted-points', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    map.addLayer({
      id: 'highlighted-layer',
      type: 'symbol',
      source: 'highlighted-points',
      layout: {
        'icon-image': [
          'case',
          ['has', 'name of institution'], // 如果是学校
          'edu-icon',
          'garden-icon'                  // 否则为社区花园
        ],
        'icon-size': 0.4, // 你可以根据需要放大或缩小
        'icon-allow-overlap': true
      }
    });
  });
});

  Promise.all([
    fetch('data/Community_Gardens_Structured_Hours_CLEAN.geojson').then(r => r.json()),
    fetch('data/Education_Systems_2.geojson').then(r => r.json())
  ]).then(([gardens, education]) => {
    allFeatures = gardens.features.concat(education.features);
    populateSidebar(allFeatures);
    populateTypeFilter(allFeatures);
  });
});

function populateSidebar(features) {
  const list = document.getElementById('featureList');
  list.innerHTML = '';
  const gardens = features.filter(f => f.properties.name);
  const schools = features.filter(f => f.properties["name of institution"]);

  if (gardens.length > 0) {
    const gardenHeader = document.createElement('h4');
    gardenHeader.textContent = '🌿 Community Gardens';
    list.appendChild(gardenHeader);

    const gardenList = document.createElement('ul');
    gardens.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = getFeatureName(f);
      li.addEventListener('click', () => drawIsochrone(f.geometry.coordinates));
      gardenList.appendChild(li);
    });
    list.appendChild(gardenList);
  }

  if (schools.length > 0) {
    const schoolHeader = document.createElement('h4');
    schoolHeader.textContent = '📚 Education Institutions';
    list.appendChild(schoolHeader);

    const schoolList = document.createElement('ul');
    schools.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = getFeatureName(f);
      li.addEventListener('click', () => drawIsochrone(f.geometry.coordinates));
      schoolList.appendChild(li);
    });
    list.appendChild(schoolList);
  }
}

function populateTypeFilter(features) {
  const filter = document.getElementById('typeFilter');

  filter.addEventListener('change', () => {
    const selected = filter.value;

    let filtered = [];

    if (selected === 'education') {
      filtered = allFeatures.filter(f => f.properties['name of institution']);
    } else if (selected === 'garden') {
      filtered = allFeatures.filter(f => f.properties.name && !f.properties['name of institution']);
    } else {
      filtered = allFeatures;
    }

    populateSidebar(filtered);
  });
}


function drawIsochrone(coords) {
  const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${coords[0]},${coords[1]}?contours_minutes=5&polygons=true&access_token=${mapboxgl.accessToken}`;
  
  fetch(url).then(r => r.json()).then(data => {
    isochronePolygon = data;

    if (map.getSource('isochrone')) {
      map.getSource('isochrone').setData(data);
    } else {
      map.addSource('isochrone', { type: 'geojson', data });
      map.addLayer({
        id: 'isochrone-layer',
        type: 'fill',
        source: 'isochrone',
        paint: {
          'fill-color': '#ffcb77',
          'fill-opacity': 0.5
        }
      });

      // ✅ 确保步行圈图层在最底部（比如低于 gardens-layer）
      if (map.getLayer('gardens-layer')) {
        map.moveLayer('isochrone-layer', 'gardens-layer');
      } else if (map.getStyle().layers.length > 0) {
        // fallback：插到图层栈的最底部
        const firstLayerId = map.getStyle().layers[0].id;
        map.moveLayer('isochrone-layer', firstLayerId);
      }
    }

    highlightIntersectingPoints(data);
  });
}


function highlightIntersectingPoints(iso) {
  const results = allFeatures.filter(f => {
    if (!turf.booleanIntersects(f.geometry, iso.features[0].geometry)) return false;
    if (!f.properties.hours) return true;

    const day = selectedTime.toLocaleString('en-US', { weekday: 'long' });
    const dayHours = f.properties.hours[day];
    if (!dayHours || !dayHours.open || !dayHours.close) return false;

    const [openH, openM] = dayHours.open.split(':').map(Number);
    const [closeH, closeM] = dayHours.close.split(':').map(Number);
    const openTime = new Date(selectedTime);
    openTime.setHours(openH, openM, 0);
    const closeTime = new Date(selectedTime);
    closeTime.setHours(closeH, closeM, 0);

    return selectedTime >= openTime && selectedTime <= closeTime;
  });

  const popupBox = document.getElementById('isochronePopup');
const namedResults = results.filter(r => getFeatureName(r));
if (namedResults.length > 0) {
  popupBox.innerHTML = '<strong>Open Now Within A Five Minute Walk:</strong><ul>' +
    namedResults.map(r => `<li>${getFeatureName(r)}</li>`).join('') +
    '</ul>';
  popupBox.classList.remove('hidden');
} else {
  popupBox.innerHTML = '<strong>No open facilities within 5-minute walk.</strong>';
  popupBox.classList.remove('hidden');
}

  if (map.getSource('highlighted-points')) {
    map.getSource('highlighted-points').setData({ type: 'FeatureCollection', features: results });
  }
}

document.getElementById('useLocation').addEventListener('click', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      drawIsochrone(coords);
      new mapboxgl.Marker().setLngLat(coords).addTo(map);
    });
  } else {
    alert('Geolocation not supported');
  }
});

document.getElementById('clearSelection').addEventListener('click', () => {
  if (map.getLayer('isochrone-layer')) map.removeLayer('isochrone-layer');
  if (map.getSource('isochrone')) map.removeSource('isochrone');
  isochronePolygon = null;

  // ✅ 清空高亮点
  if (map.getSource('highlighted-points')) {
    map.getSource('highlighted-points').setData({
      type: 'FeatureCollection',
      features: []
    });
  }

  // ✅ 清除 sidebar 中的结果（如果还保留着）
  document.getElementById('intersectResults').innerHTML = '';

  // ✅ 隐藏右边浮窗
  document.getElementById('isochronePopup').classList.add('hidden');
});


document.getElementById('toggleGardens').addEventListener('change', (e) => {
  map.setLayoutProperty('gardens-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('toggleEducation').addEventListener('change', (e) => {
  map.setLayoutProperty('education-layer', 'visibility', e.target.checked ? 'visible' : 'none');
});

document.getElementById('search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allFeatures.filter(f => getFeatureName(f).toLowerCase().includes(query));
  populateSidebar(filtered);
});

function updateCurrentTime() {
  const now = new Date();
  document.getElementById('currentTimeDisplay').textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateCurrentTime, 1000);

document.getElementById('customTime').addEventListener('input', (e) => {
  const timeParts = e.target.value.split(':');
  if (timeParts.length === 2) {
    const now = new Date();
    now.setHours(parseInt(timeParts[0]));
    now.setMinutes(parseInt(timeParts[1]));
    now.setSeconds(0);
    now.setMilliseconds(0);
    selectedTime = now;
    if (isochronePolygon) highlightIntersectingPoints(isochronePolygon);
  }
});
