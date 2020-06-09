<script>
import {onMount, afterUpdate} from 'svelte'

export let open;

$: rotate = 0;

const render = () => {
    const tan = Math.tan(130 / window.innerWidth)
    rotate = Math.atan(Math.tan(tan)) * (180/Math.PI)
    const panel = document.getElementById('panel')
    const percent = (window.innerWidth / 100) * 12
    const leftClose = window.innerWidth - percent
    const topClose = percent * tan
    const topOpen =   window.innerWidth > 768 ? (window.innerWidth / 2) * tan : ((window.innerWidth + (percent / 3)) * tan) - 4
    const leftOpen = window.innerWidth > 768 ? window.innerWidth / 2 : 0 - percent / 3
    panel.style.left = open ? String(leftOpen) + "px" : String(leftClose) + "px"
    panel.style.top = open ? String(topOpen) + "px" : String(topClose) + "px"    
}

onMount(() => setTimeout(render, 0))
afterUpdate(render)

</script>
<svelte:window on:resize={render} />
<aside id="panel" style={`transform:rotate(-${rotate}deg);`}>
    <div>
        <slot></slot>
    </div>
</aside>
<style>
aside {
    background-color: var(--green);
    padding: 1rem 2rem 0 2rem;
    position: absolute;
    z-index: 3;
    height: 100vh;
    width: 125vw;
    overflow: hidden;
    transition: all 500ms cubic-bezier(0.075, 0.82, 0.165, 1);
    box-sizing: border-box;
    box-shadow: -1px 0 4px -2px var(--shadow);
    transform-origin: 0 0; 
}
</style>