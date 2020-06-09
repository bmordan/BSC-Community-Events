<script>
    import {Button} from 'svelte-mui'
    export let togglePanel;
    export let user;
    export let onFilter;
    $: width = window.innerWidth
    $: height = window.innerHeight
    $: filterValue = 0
    const resizeFooter = () => {
        width = window.innerWidth
        height = window.innerHeight
    }
    const _onFilter = e => {
        onFilter(['all', 'pop', 'mine', 'booked'][e.target.value])
    }
</script>
<svelte:window on:resize="{resizeFooter}" />
<footer>
    <section>
        <article>
            <hgroup>
                <label>all</label>
                <label>popular</label>
                {#if user}
                    <label>mine</label>
                    <label>booked</label>
                {/if}
            </hgroup>
            <input type="range" min="0" max={!user ? "1" : "3"} name="filter" bind:value={filterValue} on:change={_onFilter} />
        </article>
        <span class="btn-action">
            <Button color="primary" raised ripple id="create" on:click={togglePanel}>
                {#if user}
                    <span style="color:var(--mauve);">Add Event</span>
                {:else}
                    <span style="color:var(--mauve);">Login</span>
                {/if}
            </Button>
        </span>
    </section>
    <svg width={width} height="130">
        <defs>
            <filter id="footer-triangle" x="0" y="0" width="200%" height="200%">
                <feDropShadow dx="-1" dy="1" stdDeviation="3" flood-color="#504547" />
            </filter>
        </defs>
        <polygon points={`0,129,${width},0,${width},129`} filter="url(#footer-triangle)" />
    </svg>
</footer>
<style>
footer {
    position: absolute;
    z-index: 3;
    bottom: 0;
    left: 0;
    right: 0;
}
footer * {
    z-index: 3;
}
section {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 1rem;
}
article {
    width: 10rem;
    display: flex;
    flex-direction: column;
}
article hgroup {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    padding-bottom: 0.25rem;
}
.btn-action {
    margin-left: 1rem;
}
svg {
    position: absolute;
    bottom: 0;
    fill: var(--mauve);
}
</style>
