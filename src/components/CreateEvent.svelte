<script>
import {Textfield, Datefield, Button} from 'svelte-mui'

export let user = null;
export let setLocation = null;
export let panelOpen;

let title = ""
let desc = ""
let date = new Date()
let time = "10:00"
let spaces = 25

const reset = () => {
    title = desc = date = ""
    time = "09:30"
    spaces = 25
}

const onSubmit = async e => {
    e.preventDefault()
    
    const [hh, mm] = time.split(":").map(Number)
    date.setHours(hh)
    date.setMinutes(mm)
    const datetime = date.toISOString().replace(/[TZ]/g, " ") + "+00:00"
    
    const body = {
        method: 'post',
        body: JSON.stringify({title, desc, datetime, spaces}),
        headers: { 'Content-Type': 'application/json' }
    }
    
    const event = await fetch(`/users/${user.id}/events?token=${user.token}`, body)
        .then(res => res.json())
        .catch(console.error)

    setLocation(event)
    
    reset()
}
</script>
<form on:submit={onSubmit}>
    <h2>Create an Event</h2>
    <Textfield
        autocomplete="off"
        label="Event Title"
        required
        bind:value={title}
        message="What is your event called?">
    </Textfield>
    <Textfield
        autocomplete="off"
        label="Description"
        required
        bind:value={desc}
        message="Give more information about your event">
    </Textfield>
    <Textfield
        autocomplete="off"
        label="Event Capacity"
        required
        type='number'
        bind:value={spaces}
        message="The maximum number of people who can attend">
    </Textfield>
    <Datefield
        label="Date"
        bind:value={date}
        local="en-GB"
        format='DD/MM/YYYY'
        required>
    </Datefield>
    <Textfield
        autocomplete="off"
        label="Time"
        type='time'
        bind:value={time}
        message="What time will it start?">
    </Textfield>
    <Button color="primary" style="color:var(--green);" raised type="submit" disabled={!panelOpen}>Create</Button>
</form>