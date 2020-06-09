const getModels = require('../lib')
let User, CommunityEvent, Location, clearDB;

describe("Init Models", () => {
    beforeAll(ready => {
        getModels((err, models) => {
            if (err) throw err
            User = models.User
            CommunityEvent = models.CommunityEvent
            Location = models.Location
            clearDB = models.clearDB
            ready()
        })
    })

    test("create a User", () => {
        return User
            .findOrCreate({where: {name: "test", phone: "123456789", password: "test_password"}})
            .then(([user, created]) => {
                expect(created).toBe(true)
                expect(user.id).toBeDefined()
                expect(user.name).toEqual("test")
                expect(user.phone).toEqual("123456789")
                expect(user.correctPassword("test_password")).toBe(true)
                expect(user.correctPassword("wrong_password")).toBe(false)
            })
    })

    test("create an event with an organiser and location", async done => {
        const user = await User.create({name: "organiser", phone: "123"})
        const local = await Location.create({lat: 51.5045, lng: -0.0886887})
        let communityEvent = await CommunityEvent.create({
            title: "test event",
            desc: "can relate to a user",
            datetime: "1970-01-01T09:00:0.000Z",
            spaces: 3
        })
        await communityEvent.setUser(user)
        await communityEvent.setLocation(local)
        
        const result = await CommunityEvent.findOne({
            where: {
                id: communityEvent.id
            },
            include: [
                {model: User},
                {model: Location}
            ]})
        const createdBy = await result.getUser()
        expect(result.title).toEqual("test event")
        expect(result.location).toBeDefined()
        expect(result.location.lat).toBe(51.5045)
        expect(createdBy.name).toEqual("organiser")
        done()
    })

    test("book an event as a member", async done => {
        const organiser = await User.create({name: "organiser", phone: "123"})
        const local = await Location.create({lat: 51.5045, lng: -0.0886887})
        const member1 = await User.create({name: "member1", phone: "456"})
        const member2 = await User.create({name: "member2", phone: "789"})
        const communityEvent = await CommunityEvent.create({
            title: "test booking event",
            desc: "desc",
            datetime: "1970-01-01T09:00:0.000Z",
            spaces: 3
        })
        await communityEvent.setUser(organiser)
        await communityEvent.setLocation(local)
        await communityEvent.addUser(member1)
        await communityEvent.addUser(member2)
        
        const [result] = await CommunityEvent.findAll({where: {id: communityEvent.id}, include: [{model: User}, {model: Location}]})

        expect(result.users.length).toBe(2)
        expect(result.spaces - result.users.length).toBe(1)
        done()
    })

    afterAll(() => {
        clearDB()
    })
})