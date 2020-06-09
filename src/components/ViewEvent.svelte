<script>
import {Button} from 'svelte-mui'
export let event;
export let user;
export let closeEventPanel;
export let onBook;

</script>
<article>
    <header>
        <img src="/pin.png" alt="pin icon" width="32px" />
        <h2>{event.title}</h2>
    </header>
    <main>
        <h3>{new Date(event.datetime).toGMTString()}</h3>
        <p>
            {event.desc}
        </p>
        <p>
            <small>Organiser&nbsp;</small>{event.user.name} <a href={`tel:${event.user.phone}`}>{event.user.phone}</a><br/>
            <small>Capacity&nbsp;</small>{event.spaces}<br/>
            <small>Booked&nbsp;</small>{event.users.length}
        </p>
    </main>
    <footer>
        {#if event.spaces - event.users.length <= 0}
            <Button color="primary" unelevated disabled>Fully Booked</Button>
        {:else if user && user.id === event.userId}
            <Button color="primary" unelevated disabled>Your Event</Button>
        {:else if user && event.users.map(u => u.id).includes(user.id)}
            <Button color="primary" unelevated disabled>Attending</Button>
        {:else}
            <Button color="primary" raised ripple on:click={e => onBook(event)}>Book</Button>
        {/if}
        <Button color="secondary" on:click={closeEventPanel}>close</Button>
    </footer>
</article>
<style>
article {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 65vh;
}
article main {
    flex: auto;
}
article main h3, article main p {
    padding: 1rem 0;
}
header {
    color: var(--shadow);
    display: flex;
    align-items: center;
}
header h2 {
    margin-left: 1rem;
}
small {
    display: inline-block;
    font-size: 0.75rem;
    min-width: 4rem;
}
</style>