<script>
    import L from 'leaflet'
    import { onMount, afterUpdate } from 'svelte'
    import {Snackbar, Button} from 'svelte-mui'

    export let onMapLoad;

    $: leafletMap = null;
    let mapContainer

    onMount(() => {   
        navigator.geolocation.getCurrentPosition(position => {
            leafletMap = L.map(mapContainer, {
                svgSprite: false,
                zoomControl: false,
                center: [position.coords.latitude, position.coords.longitude],
                zoom: 15
            })

            onMapLoad(leafletMap)
        })
    })

    const resizeMap = () => {
        if (!leafletMap) return
        leafletMap.invalidateSize()
    }
</script>
<svelte:window on:resize="{resizeMap}" />
<div id="map" class="map" bind:this="{mapContainer}">
    <slot></slot>
</div>
<style>
.map {
   height: 100vh;
   width: 100vw;
}
</style>