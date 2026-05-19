mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';
// =========================
// MAP INIT
// =========================

// CLIP TO NORTH AMERICA ONLY
const map = new mapboxgl.Map({
    container: 'map',

    style: 'mapbox://styles/j00by/clvx7jcp006zv01ph3miketyz',

    center: [-96, 39],
    zoom: 4.4,


    maxBounds: [
        [-220.0, -20.0],
        [-50.0, 74.0]
    ],

    projection: {
        name: 'mercator'
    }
});


// =========================
// ARCHETYPE DEFINITIONS
// =========================
const archetypeDefinitions = {
    "Destination": "Climate safe and growing",
    "Coastal Destination": "Climate safe coastal growth area",
    "Opportunity": "Climate safe but not growing",
    "Risk": "Not climate safe but growing",
    "Origin": "Not climate safe and not growing"
};

// =========================
// ARCHETYPE COLORS
// =========================
const archetypeColors = {
    "Risk": "#d73027",
    "Origin": "#fc8d59",
    "Opportunity": "#45b4ab",
    "Destination": "#278a2c",
    "Coastal Destination": "#1a9850"
};

const tooltip = document.getElementById('map-tooltip');


// =========================
// LOAD MAP
// =========================
map.on('load', function () {

    // =========================
    // SOURCE
    // =========================
    map.addSource('archetypes', {
        type: 'geojson',
        data: 'data/archetypes.geojson'
    });

    // =========================
    // LAYER
    // =========================
    map.addLayer({
        id: 'archetypePoints',
        type: 'circle',
        source: 'archetypes',
        paint: {
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#000',

            'circle-color': [
                'match',
                ['to-string', ['get', 'new_archetype']],

                'Risk', '#d73027',
                'Origin', '#fc8d59',
                'Opportunity', '#45b4ab',
                'Destination', '#278a2c',
                'Coastal Destination', '#1a9850',

                '#999999'
            ]
        }
    });

    // =========================
    // FILTER BOX (FIXED POSITION)
    // =========================
    const filtersDiv = document.createElement('div');

    filtersDiv.id = 'filters';

    filtersDiv.style.position = 'absolute';

    // 🔥 FIX: moved LOWER so it does NOT overlap logo
    filtersDiv.style.top = '120px';

    filtersDiv.style.left = '20px';

    filtersDiv.style.zIndex = '9999';

    filtersDiv.style.background = 'rgba(255,255,255,0.96)';

    filtersDiv.style.padding = '16px';

    filtersDiv.style.borderRadius = '12px';

    filtersDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.15)';

    filtersDiv.style.fontFamily = "'Poppins', Arial, sans-serif";

    filtersDiv.style.minWidth = '230px';

    filtersDiv.innerHTML = `
        <div style="font-size:16px;font-weight:700;margin-bottom:12px;">
            Filter Archetypes
        </div>

        <label style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <input type="checkbox" value="Risk" checked>
            Risk
        </label>

        <label style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <input type="checkbox" value="Origin" checked>
            Origin
        </label>

        <label style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <input type="checkbox" value="Opportunity" checked>
            Opportunity
        </label>

        <label style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <input type="checkbox" value="Destination" checked>
            Destination
        </label>

        <label style="display:flex;align-items:center;gap:10px;">
            <input type="checkbox" value="Coastal Destination" checked>
            Coastal Destination
        </label>
    `;

    document.body.appendChild(filtersDiv);


    // =========================
    // FILTER LOGIC (SAFE)
    // =========================
    const checkboxes = document.querySelectorAll('#filters input');

    function updateFilters() {

        const selected = [];

        checkboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        if (!selected.length) {
            map.setFilter('archetypePoints', ['==', ['get', 'new_archetype'], '']);
            return;
        }

        map.setFilter('archetypePoints', [
            'in',
            ['get', 'new_archetype'],
            ['literal', selected]
        ]);
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', updateFilters);
    });

    updateFilters();


    // =========================
    // TOOLTIP
    // =========================
    map.on('mousemove', (e) => {

        const features = map.queryRenderedFeatures(e.point, {
            layers: ['archetypePoints']
        });

        if (!features.length) {
            map.getCanvas().style.cursor = '';
            tooltip.style.display = 'none';
            return;
        }

        map.getCanvas().style.cursor = 'pointer';

        const p = features[0].properties;

        const city = p.NAME || p.name || "Unknown";
        const state = p.state || "NA";
        const archetype = (p.new_archetype || "").trim();

        const color = archetypeColors[archetype] || "#999999";
        const definition = archetypeDefinitions[archetype] || "No definition available";

        tooltip.style.display = 'block';
        tooltip.style.left = e.point.x + 15 + 'px';
        tooltip.style.top = e.point.y + 15 + 'px';

        tooltip.innerHTML = `
            <div style="font-family:'Apercu Pro', Arial, sans-serif;color:#111;">

                <div style="font-size:24px;font-weight:600;margin-bottom:8px;">
                    ${city}, ${state}
                </div>

                <div style="font-size:16px;margin-bottom:4px;">
                    <strong>Climate Migration Archetype:</strong>
                    <span style="color:${color};font-weight:700;">
                        ${archetype}
                    </span>
                </div>

                <div style="font-size:16px;color:#444;">
                    This archetype is defined as:<br>
                    <em>${definition}</em>
                </div>

            </div>
        `;
    });


    // =========================
    // POPUP
    // =========================
    map.on('click', (e) => {

        const features = map.queryRenderedFeatures(e.point, {
            layers: ['archetypePoints']
        });

        if (!features.length) return;

        const p = features[0].properties;

        const city = p.NAME || p.name || "Unknown";
        const state = p.state || "NA";
        const archetype = (p.new_archetype || "").trim();

        const color = archetypeColors[archetype] || "#999999";
        const definition = archetypeDefinitions[archetype] || "No definition available";

        new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
                <div style="font-family:'Apercu Pro', Arial, sans-serif;color:#111;">

                    <div style="font-size:24px;font-weight:600;margin-bottom:8px;">
                        ${city}, ${state}
                    </div>

                    <div style="font-size:16px;margin-bottom:4px;">
                        <strong>Climate Migration Archetype:</strong>
                        <span style="color:${color};font-weight:700;">
                            ${archetype}
                        </span>
                    </div>

                    <div style="font-size:16px;color:#444;">
                        This archetype is generally considered to be:<br>
                        <em>${definition}</em>
                    </div>

                </div>
            `)
            .addTo(map);
    });

});