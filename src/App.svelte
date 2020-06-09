<script>
import L from 'leaflet'
import {onMount, setContext, afterUpdate} from 'svelte'
import {Snackbar, Button} from 'svelte-mui'
import Map from './components/Map.svelte'
import TileLayer from './components/TileLayer.svelte'
import Header from './components/Header.svelte'
import Footer from './components/Footer.svelte'
import Panel from './components/SlidePanel.svelte'
import Login from './components/Login.svelte'
import CreateEvent from './components/CreateEvent.svelte'
import Pins from './components/Pins.svelte'
import Pin from './components/Pin.svelte'
import ViewEvent from './components/ViewEvent.svelte'

$: leafletMap = null
$: panelOpen = false
$: user = null
$: panelLabel = 'login'
$: selectedEvent = null
$: creatingEvent = null
$: lat = 0.0
$: lng = 0.0
$: bookingEvent = null
$: bookingSuccess = false
$: filteredEvents = []
$: unfilteredEvents = []

setContext('map', {
    getMap: () => leafletMap
})

const onBook = event => {
    bookingEvent = event.id
    
    if (!user) {
        panelLabel = 'login'
        panelOpen = true
    } else {
        bookEventForUser()
    }    
}

const bookEventForUser = () => {
    return fetch(`/users/${user.id}/events/${bookingEvent}/book?token=${user.token}`)
        .then(res => res.json())
        .then(event => {
            const index = unfilteredEvents.map(e => e.id).indexOf(event.id)
            unfilteredEvents[index] = event
            bookingEvent = false
            bookingSuccess = true
            onFilter('all')
        })
        .catch(err => {
            console.error(err)
            bookingEvent = false
        })
}

const togglePanel = e => {
    panelOpen = !panelOpen
}

const closeEventPanel = () => {
    panelOpen = false
    panelLabel = user ? 'create' : 'login'
    selectedEvent = null
}

const setUser = logged_in_user => {
    user = logged_in_user
    panelOpen = false
    panelLabel = logged_in_user ? 'create' : 'login'
    if (bookingEvent) bookEventForUser()
}
const setLocation = new_event => {
    panelOpen = false
    creatingEvent = `/users/${user.id}/events/${new_event.id}/location?token=${user.token}`
    document.getElementById('map').style.cursor = 'crosshair'
}

const onMapLoad = map => {
    leafletMap = map
    filteredEvents = [...filteredEvents]
}

const onEventSelect = event => {
    panelLabel = 'event'
    panelOpen = true
    selectedEvent = event
}

const setPin = async () => {
    const body = {
        method: 'post',
        body: JSON.stringify({lat, lng}),
        headers: {'Content-Type': 'application/json'}
    }
    
    const event = await fetch(creatingEvent, body)
        .then(res => res.json())
        .catch(console.error)
    
    document.getElementById('map').style.cursor = 'grab'
    
    panelOpen = false
    creatingEvent = null
    lat = 0.0
    lng = 0.0
    unfilteredEvents = [...unfilteredEvents, event]
    filteredEvents = [...filteredEvents, event]
}

const onFilter = filterType => {
    const applyFilter = {
        all: () => {
            return [...unfilteredEvents]
        },
        pop: () => unfilteredEvents.filter(e => {
            return e.spaces > 10 && e.spaces - e.users.length <= 2
        }),
        mine: () => {
            return unfilteredEvents.filter(e => {
                return e.userId === user.id
            })
        },
        booked: () => {
            return unfilteredEvents.filter(e => {
                return e.users.map(u => u.id).includes(user.id)
            })            
        }
    }
    const filtered = applyFilter[filterType]()
    filteredEvents = [...filtered]
}

onMount(async () => {
    unfilteredEvents = await fetch('/events').then(res => res.json())
    filteredEvents = [...unfilteredEvents]
    panelLabel = user ? 'create' : 'login'
})

</script>
<Header></Header>
<Snackbar bg='var(--green)' bind:visible={creatingEvent} timeout={0}>
    Select event location <span slot="action"><Button raised ripple color="primary" on:click={setPin}>Set Pin</Button></span>
</Snackbar>
<Snackbar bg='var(--green)' bind:visible={bookingSuccess} timeout={5}>
    You have booked successfully!
</Snackbar>
<main>
    <Map onMapLoad={onMapLoad} >
        <TileLayer></TileLayer>
    </Map>
</main>
{#if creatingEvent}
    <Pin bind:leafletMap bind:lat bind:lng ></Pin>
{/if}
<Pins bind:filteredEvents onEventSelect={onEventSelect}></Pins>
<Panel open={panelOpen}>
    {#if panelLabel === 'login'}
        <Login setUser={setUser} panelOpen={panelOpen} />
    {:else if panelLabel === 'create'}
        <CreateEvent user={user} setLocation={setLocation} panelOpen={panelOpen}></CreateEvent>
    {:else if panelLabel === 'event'}
        <ViewEvent bind:user event={selectedEvent} onBook={onBook} closeEventPanel={closeEventPanel} panelOpen={panelOpen}></ViewEvent>
    {/if}
</Panel>
<Footer togglePanel={togglePanel} user={user} onFilter={onFilter}></Footer>
<style>
main {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
}
</style>