const express = require('express')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const {version} = require('./package.json')
const app = express()
const path = require('path')
const tokens = new Set()

let User, CommunityEvent, Location, clearDB;
const getModels = require('./lib')
const loadModels = (req, res, next) => {
    if (!User || !CommunityEvent || !Location ) {
        getModels((err, models) => {
            if (err) throw err
            User = models.User;
            CommunityEvent = models.CommunityEvent;
            Location = models.Location;
            next()
        })
    } else {
        next()
    }
}

const checkJWT = async function (req, res, next) {
    const user = await User.findByPk(req.params.user_id || req.params.id)

    try {
        const decoded = jwt.verify(req.query.token, String(user.password))
        tokens.has(req.query.token) 
        && decoded.data === user.id
        && decoded.exp > Math.round(new Date().getTime() / 1000)
        ? next() : res.sendStatus(403)
    } catch (err) {
        console.error(err)
        res.sendStatus(403)
    }
}

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('public', {index: "index.html"}))

app.get("/", loadModels, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.post("/tokens", loadModels, async (req, res) => {
    const user = await User.findOne({where: {phone: req.body.phone}})
    if (!user) {
        res.sendStatus(404)
    }
    else if (user.correctPassword(req.body.password)) {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: user.id}, String(user.password))
        if (!tokens.has(token)) {
            tokens.add(token)
            const userForClient = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                token: token
            }
            res.send(userForClient)
        }
    } else {
        res.sendStatus(403)
    }
})

app.get("/tokens/remove/:token", async (req, res) => {
    tokens.delete(req.params.token)
    res.sendStatus(204)
})

app.get("/dropall", loadModels, (req, res) => {
    if (process.env.NODE_ENV === 'test') clearDB()
    tokens.clear()
    res.sendStatus(204)
})

app.get("/events", loadModels, async (req, res) => {
    try {
        const events = await CommunityEvent.findAll({
            where: {
                datetime: {
                    [Op.gte]: new Date().toISOString()
                }
            },
            include: [
                {model: User},
                {model: Location}
            ],
            order: [
                ['datetime','ASC']
            ]
        })
        const events_to_json = await Promise.all(events.map(async event => {
            const organiser = await User.findByPk(event.userId)
            return {...event.get({plain: true}), user: organiser.get({plain: true})}
        }))
        res.send(events_to_json)
    } catch(err) {
        res.status(400).send(err)
    }
})

app.post("/users", loadModels, async (req, res) => {
    try {
        let user = await User.findOne({where: {phone: req.body.phone}})
        if (user) {
            res.status(403).send("User with that phone number already exists")
        } else {
            user = await User.create(req.body)
            res.send(user.get({plain: true}))
        }
    } catch(err) {
        res.status(400).send(err)
    }
})

app.post("/users/:id/events", checkJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id)
        const event = await CommunityEvent.create(req.body)
        await event.setUser(user)
        res.send({...event.get({plain: true}), user: user.get({plain: true})})
    } catch(err) {
        res.status(400).send(err)
    }
})

app.get("/users/:user_id/events/:event_id/book", checkJWT, async (req, res) => {
    const user = await User.findByPk(req.params.user_id)
    const event = await CommunityEvent.findOne({where: {id: req.params.event_id}, include: [{model: User}, {model: Location}]})
    if (event.spaces > event.users.length) {
        await event.addUser(user)
        const updated_event = await await CommunityEvent.findOne({where: {id: req.params.event_id}, include: [{model: User}, {model: Location}]})
        res.send({...updated_event.get({plain: true}), user: user.get({plain: true})})
    } else {
        res.status(400).send(new Error("event is fully booked 😖"))
    }
})

app.get("/users/:user_id/events/:event_id/delete", checkJWT, async (req, res) => {
    try {
        const event = await CommunityEvent.findByPk(req.params.event_id)
        await event.destroy()
        res.status(204).send()
    } catch(err) {
        console.error(err)
        res.status(400).send(err)
    }
})

app.post("/users/:user_id/events/:event_id/location", checkJWT, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.user_id)
        const location = await Location.create(req.body)
        const _event = await CommunityEvent.findByPk(req.params.event_id)
        await _event.setLocation(location)
        const event = await CommunityEvent.findOne({where: {id: req.params.event_id}, include: [{model: User}, {model: Location}]})
        res.send({...event.get({plain: true}), user: user.get({plain: true})})
    } catch(err) {
        res.status(400).send(err)
    }

})

app.get("/events/:id", async (req, res) => {
    const event = await CommunityEvent.findOne({where: {id: req.params.id}, include: [{model: User}, {model: Location}]})
    if (event) {
        res.send(event.get({plain: true}))
    } else {
        res.status(404).send(new Error(`can't find event with id ${req.params.id}`))
    }
})

module.exports = app