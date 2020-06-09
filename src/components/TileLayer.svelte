<script>
    import L from 'leaflet';
    import { onMount } from 'svelte';
    
    const tiles = {
        attribution: '<a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        description: 'OSM Humanitarian',
        url: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    }

    onMount(() => {
      L.Map.addInitHook(function() {
        const map = this
        const {url, attribution} = tiles
        L.tileLayer(url, {
          attribution,            
          maxZoom: 19,
          id: 'cartodb.dark.matter.2'
        }).addTo(map);                       
      })
    })
        
</script>