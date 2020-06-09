const server = require('../server.js')
const fetch = require('node-fetch')
const baseurl = 'http://localhost:3001'
const createBody = body => ({
    method: 'post',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
})

const today = new Date()
const futureDateISOString = new Date(today.setFullYear(today.getFullYear() + 1))
    .toISOString()
    .replace(/[TZ]/g," ") + "+00:00"
describe("Community Events Ltd RESTful Server", () => {
    beforeAll(ready => {
        server.listen(3001, async () => {
            await fetch(baseurl + '/dropall')
            ready()
        })
    })
    
    test("the server is running on a test port", async done => {
        const res = await fetch(baseurl)
        expect(res.status).toBe(200)
        done()
    })
    
    test("you can create a user", async done => {
        const body = createBody({name: "user1", phone: "111", password: "---"})
        const user = await fetch(baseurl + '/users', body).then(res => res.json())
        expect(user.name).toEqual("user1")
        expect(user.id).toBeDefined()
        done()
    })

    test("users have to have uniq phone number", async done => {
        const user1_body = createBody({name: "user1", phone: "222", password: "***"})
        const user2_body = createBody({name: "user2", phone: "222", password: "***"})
        await fetch(baseurl + `/users`, user1_body)
        const error = await fetch(baseurl + `/users`, user2_body)
        expect(error.status).toBe(403)
        done()
    })

    test("an organiser can create an event", async done => {
        const user_body = createBody({name: "user2", phone: "333", password: "***"})
        const auth_body = createBody({phone: "333", password: "***"})
        const event_body = createBody({
            title: "test event",
            desc: "test desc",
            datetime: futureDateISOString,
            spaces: 100
        })
        const user = await fetch(baseurl + '/users', user_body).then(res => res.json()) 
        const {token} = await fetch(baseurl + '/tokens', auth_body).then(res => res.json())
        expect(token.length).toBe(140)
        const event = await fetch(baseurl + `/users/${user.id}/events?token=${token}`, event_body).then(res => res.json())
        
        expect(event.title).toEqual("test event")
        expect(user.name).toEqual("user2")
        await fetch(baseurl + `/tokens/remove/${token}`)
        done()
    })

    test("a member can book an event", async done => {
        const organiser_body = createBody({name: "organiser", phone: "456", password: "***"})
        const member1_body = createBody({name: "member1", phone: "123", password: "***"})
        const member2_body = createBody({name: "member2", phone: "987", password: "***"})
        const event_body = createBody({
            title: "test event 2",
            desc: "test desc",
            datetime: futureDateISOString,
            spaces: 3
        })
        const organiser = await fetch(baseurl + '/users', organiser_body).then(res => res.json())
        const member1 = await fetch(baseurl + '/users', member1_body).then(res => res.json())
        const member2 = await fetch(baseurl + '/users', member2_body).then(res => res.json())

        const organiser_jwt = await fetch(baseurl + '/tokens', createBody({phone: organiser.phone, password: "***"})).then(res => res.json())
        const member1_jwt = await fetch(baseurl + '/tokens', createBody({phone: member1.phone, password: "***"})).then(res => res.json())
        const member2_jwt = await fetch(baseurl + '/tokens', createBody({phone: member2.phone, password: "***"})).then(res => res.json())

        const event = await fetch(baseurl + `/users/${organiser.id}/events?token=${organiser_jwt.token}`, event_body).then(res => res.json())
        
        expect(event.title).toEqual("test event 2")
        expect(event.user.phone).toEqual("456")
        expect(member1.id).toBeDefined()

        await fetch(baseurl + `/users/${member1.id}/events/${event.id}/book?token=${member1_jwt.token}`).then(res => res.json())
        await fetch(baseurl + `/users/${member2.id}/events/${event.id}/book?token=${member2_jwt.token}`).then(res => res.json())
        
        const updated_event = await fetch(baseurl + `/events/${event.id}`).then(res => res.json())
        expect(updated_event.users.length).toBe(2)

        const member3_body = createBody({name: "member3", phone: "555", password: "*-*"})
        const member4_body = createBody({name: "member4", phone: "789", password: "*-*"})
        const member3 = await fetch(baseurl + '/users', member3_body).then(res => res.json())
        const member4 = await fetch(baseurl + '/users', member4_body).then(res => res.json())
        const member3_jwt = await fetch(baseurl + '/tokens', createBody({phone: member3.phone, password: "*-*"})).then(res => res.json())
        const member4_jwt = await fetch(baseurl + '/tokens', createBody({phone: member4.phone, password: "*-*"})).then(res => res.json())
        
        await fetch(baseurl + `/users/${member3.id}/events/${event.id}/book?token=${member3_jwt.token}`).then(res => res.json())
        
        const isfull = await fetch(baseurl + `/users/${member4.id}/events/${event.id}/book?token=${member4_jwt.token}`)
        
        expect(isfull.status).toBe(400)

        const error = await fetch(baseurl + `/users/${member1.id}/events?token=invalidjwt.123.boo`, event_body)
        
        expect(error.status).toBe(403)
        done()
    })

    test("an event can be connected to a location", async done => {
        const organiser_body = createBody({name: "organiser", phone: "666", password: "_@_"})
        const organiser = await fetch(baseurl + '/users', organiser_body).then(res => res.json())
        const event_body = createBody({
            title: "test event 3 with location",
            desc: "test desc",
            datetime: futureDateISOString,
            spaces: 4
        })
        const {token} = await fetch(baseurl + '/tokens', createBody({phone: "666", password: "_@_"})).then(res => res.json())
        const event = await fetch(baseurl + `/users/${organiser.id}/events?token=${token}`, event_body).then(res => res.json())
        const location_body = createBody({lat: 51.4834394,lng: -0.1055785})
        const event_with_location = await fetch(baseurl + `/users/${organiser.id}/events/${event.id}/location?token=${token}`, location_body).then(res => res.json())

        expect(event_with_location.location.lat).toBe(51.4834394)
        expect(event_with_location.user.phone).toEqual("666")
        expect(event_with_location.users.length).toBe(0)
        expect(event_with_location.title).toEqual("test event 3 with location")
        done()
    })

    test("organisers can delete their events", async done => {
        const organiser = await fetch(baseurl + '/users', createBody({name: "flaky organiser", phone: "777", password: "BOO"})).then(res => res.json())
        const {token} = await fetch(baseurl + '/tokens', createBody({phone: "777", password: "BOO"})).then(res => res.json())
        const event_body = createBody({
            title: "test event 4 to be deleted",
            desc: "test desc",
            datetime: futureDateISOString,
            spaces: 4
        })
        const event = await fetch(baseurl + `/users/${organiser.id}/events?token=${token}`, event_body).then(res => res.json())
        const events = await fetch(baseurl + '/events').then(res => res.json())
        expect(events.length).toBe(4)
        const delete_event = await fetch(baseurl + `/users/${organiser.id}/events/${event.id}/delete?token=${token}`)
        expect(delete_event.status).toBe(204)
        const updated_events = await fetch(baseurl + '/events').then(res => res.json())
        expect(updated_events.length).toBe(3)
        done()
    })

    test("get all the events (but not the ones in the past)", async done => {
        const organiser = await fetch(baseurl + '/users', createBody({name: "organiser_with_past_events", phone: "888", password: "BOO"})).then(res => res.json())
        const {token} = await fetch(baseurl + '/tokens', createBody({phone: "888", password: "BOO"})).then(res => res.json())
        const event_bodies = [
            createBody({
                title: "past event",
                desc: "test desc",
                datetime: "2020-01-31 09:30:0.000 +01:00",
                spaces: 4
            }),
            createBody({
                title: "future event",
                desc: "test desc",
                datetime: futureDateISOString,
                spaces: 4
            })
        ]
        await Promise.all(event_bodies.map(body => {
            return fetch(baseurl + `/users/${organiser.id}/events?token=${token}`, body)
        }))
        const events = await fetch(baseurl + "/events").then(res => res.json())
        expect(events.length).toBe(4)
        expect(events[events.length - 1].title).toEqual("future event")
        done()
    })

    afterAll(() => {
        server.close()
    })
})