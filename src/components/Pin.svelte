<script>
    import L from 'leaflet'
    import {afterUpdate} from 'svelte'

    export let leafletMap;
    export let lat;
    export let lng

    $: marker = null

    const icon = L.icon({
        iconUrl: '/pin.png',
        iconSize: [20, 31]
    })

    const updateLatLng = event => {
        lat = event.latlng.lat
        lng = event.latlng.lng
        marker.setLatLng([lat, lng]).update()
        console.log(lat, lng)
    }

    afterUpdate(() => {
        if (!leafletMap) return
        if (lat === 0.0 && lng === 0.0) {
            marker = L.marker([lat, lng], {icon}).addTo(leafletMap)
            leafletMap.on('click', updateLatLng)
        }
    })
</script>
