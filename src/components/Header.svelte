<script>
    $: width = window.innerWidth
    const resizeHeader = () => {
        width = window.innerWidth
    }
</script>
<svelte:window on:resize="{resizeHeader}" />
<header>
    <img src="/community_events.svg" alt="community events" />
    <svg width={width} height="130">
        <defs>
            <filter id="header-triangle" x="0" y="0" width="200%" height="200%">
                <feDropShadow dx="1" dy="-1" stdDeviation="3" flood-color="#504547" />
            </filter>
        </defs>
        <polygon points={`0,0,${width},0,0,130`} filter="url(#header-triangle)" />
    </svg>
</header>
<style>
header {
    position: relative;
    z-index: 4;
}
img {
    position: absolute;
    top:.5rem;
    left:.5rem;
    z-index: 4;
    max-width: 276px;
}
svg {
    position: absolute;
    top: 0;
    fill: var(--mauve);
}
</style>