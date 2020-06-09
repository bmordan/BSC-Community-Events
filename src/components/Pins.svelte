<script>
    import L from 'leaflet'
    import {afterUpdate, onMount, getContext} from 'svelte'

    export let filteredEvents;
    export let onEventSelect;

    $: pinsLayerGroup = null

    const icon = L.icon({
        iconUrl: '/pin.png',
        iconSize: [20, 31]
    })

    const renderPins = events => {
        const {getMap} = getContext('map')
        const map = getMap()
        if (!map) return
        
        const markers = filteredEvents.map((e, i) => {
            const {lat, lng} = e.location
            const marker = L.marker([lat, lng], {icon})
            
            marker.on('click', event => {
                map.setView(event.target.getLatLng())
                onEventSelect(filteredEvents[i])
            })
            return marker
        }).filter(marker => marker)

        if (pinsLayerGroup) map.removeLayer(pinsLayerGroup)
        pinsLayerGroup = L.layerGroup(markers)
        pinsLayerGroup.addTo(map)
    }

    onMount(() => {
        renderPins(filteredEvents)
    })

    afterUpdate(() => {
        renderPins(filteredEvents)
    })
</script>
