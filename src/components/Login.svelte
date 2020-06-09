<script>
import jwt from 'jsonwebtoken'
import {Textfield, Button} from 'svelte-mui'

export let setUser;
export let panelOpen;

$: create = false

let name = ""
let phone = ""
let password = ""

const onSubmit = async function (e) {
    e.preventDefault()
    
    const body = {
        method: 'post',
        body: JSON.stringify({name, phone, password}),
        headers: { 'Content-Type': 'application/json' }
    }
    
    if (create) {
        await fetch("/users", body).catch(console.error)
    }

    const user = await fetch("/tokens", Object.assign(body, {body: JSON.stringify({phone, password})}))
        .then(res => res.json())
        .catch(err => {
            console.log("error caught its a 404", err)
            return null
        })
    name = phone = password = ""
    
    setUser(user)
}
</script>
<form on:submit={onSubmit}>
    {#if create}
        <h2>Join the Community</h2>
        <Textfield
            autocomplete="off"
            label="Full Name"
            required
            bind:value={name}
            message="enter your name"
        ></Textfield>  
    {:else}  
        <h2>Login</h2>
    {/if}
    <Textfield
        autocomplete="off"
        label="Phone number"
        type="tel"
        required
        bind:value={phone}
        message="no spaces just your uk phone number"
    ></Textfield>
    <Textfield
        autocomplete="off"
        label="Password"
        required
        bind:value={password}
        type="password"
        message="enter your password"
    ></Textfield>
    <br />
    {#if create}
        <Button color="primary" raised ripple disabled={!panelOpen}><span style="color:var(--green);">Join</span></Button>
    {:else}
        <Button color="primary" raised ripple><span style="color:var(--green);" disabled={!panelOpen}>Login</span></Button>
        <Button color="secondary" type="button" on:click={e => (create = true)}>Become a member</Button>
    {/if}
    <Button type="button" color="secondary" on:click={e => setUser(null)}>close</Button>
</form>
