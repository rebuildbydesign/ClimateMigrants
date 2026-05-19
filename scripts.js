mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';
mapboxgl.accessToken = 'pk.eyJ1IjoiajAwYnkiLCJhIjoiY2x1bHUzbXZnMGhuczJxcG83YXY4czJ3ayJ9.S5PZpU9VDwLMjoX_0x5FDQ';

// =========================
// MAP INIT
// =========================
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-98.5, 39.5],
    zoom: 4
});

// =========================
// ARCHETYPE DEFINITIONS
// =========================
const archetypeDefinitions = {
    "Destination": "Climate safe and growing",
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
    "Destination": "#278a2c"
};

// TOOLTIP
const tooltip = document.getElementById('map-tooltip');

// =========================
// LOAD MAP
// =========================
map.on('load', function () {

    // =========================
    // GEOJSON SOURCE
    // =========================
    map.addSource('archetypes', {
        type: 'geojson',
        data: 'data/archetypes.geojson'
    });

    // =========================
    // POINT LAYER
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

                '#999999'
            ]
        }
    });

    // =========================
    // HOVER TOOLTIP
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
    tooltip.style.left = e.point.x + 60 + 'px';
    tooltip.style.top = e.point.y + 60 + 'px';

    tooltip.innerHTML = `
        <div style="font-family:'Apercu Pro', Arial, sans-serif; color:#111;">

            <!-- CITY + STATE -->
            <div style="font-size:24px; font-weight:600; margin-bottom:8px;">
                ${city}, ${state}
            </div>

            <!-- ARCHETYPE LABEL -->
            <div style="font-size:16px; margin-bottom:4px;">
                <strong>Climate Migration Archetype:</strong>
                <span style="color:${color}; font-weight:700;">
                    ${archetype}
                </span>
            </div>

            <!-- DEFINITION -->
            <div style="font-size:16px; color:#444;">
                This archetype is defined as:<br>
                <em>${definition}</em>
            </div>

        </div>
    `;
});

    // =========================
    // CLICK POPUP
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
            <div style="font-family:'Apercu Pro', Arial, sans-serif; color:#111;">

                <!-- CITY + STATE -->
                <div style="font-size:24px; font-weight:600; margin-bottom:8px;">
                    ${city}, ${state}
                </div>

                <!-- ARCHETYPE -->
                <div style="font-size:16px; margin-bottom:4px;">
                    <strong>Climate Migration Archetype:</strong>
                    <span style="color:${color}; font-weight:700;">
                        ${archetype}
                    </span>
                </div>

                <!-- DEFINITION -->
                <div style="font-size:16px; color:#444;">
                    This archetype is generally considered to be:<br>
                    <em>${definition}</em>
                </div>

            </div>
        `)
        .addTo(map);
});

});