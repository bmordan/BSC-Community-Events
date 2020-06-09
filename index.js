const getModels = require('./lib')
const server = require('./server')
server.listen(process.env.PORT || 3000, () => {
    getModels(async (err, models) => {
        const { User, CommunityEvent, Location } = models
        const users = await User.findAll()
        if (!users.length) { // if the database is empty seed it with the following
            const organiser = await User.create({
                name: "Hatter",
                phone: "111",
                password: "password"
            })
            const member = await User.create({
                name: "Mo Hammer",
                phone: "222",
                password: "password"
            })
            const events = [
                {
                    title: "Moon landings remembered",
                    desc: "Come and spend the evening reliving the first moon landing. We will hear from professor Robert Simons about the Apollo project, and what happened to the women who were a part of that programme. Coffee and teas will be served. Places are limited so book your slot now!",
                    datetime: "2020-07-23 14:30:0.000 +00:00",
                    spaces: 12,
                    userId: organiser.id
                },
                {
                    title: "North Pole Alone",
                    desc: "This exhibition of photos from Nat Taylors solo expedition to the North Pole in 2007 is a stark reminder of the progress of climate change. At 8.30pm Nat will give a talk about her expedition and take questions from those attending.",
                    datetime: "2020-08-12 20:30:0.000 +00:00",
                    spaces: 236,
                    userId: organiser.id
                },
                {
                    title: "20 20 Cricket",
                    desc: "(For under 16s) 20 20 Cricket has teams playing overs of no more that twenty minutes. This revised format of the game is great for young people. Come and give it a go. Bats and balls will be provided.",
                    datetime: "2020-08-09 16:00:0.000 +00:00",
                    spaces: 80,
                    userId: organiser.id
                },
                {
                    title: "Dog Show",
                    desc: "Join the local dogs of Walworth for our yearly dog show. Best in show, waggest tail, highest jumper. Judges this year is the Major of Southwark and Neil Coyle! (MP for Bermondsey & Old Southwark",
                    datetime: "2020-08-18 11:00:0.000 +00:00",
                    spaces: 180,
                    userId: organiser.id
                },
                {
                    title: "Summer Cookery School",
                    desc: "Join this years cookery school with chef Katline Randell. Over the course of the day Katline will be showing everyone her home made donuts that you can bake in the oven at home. Very limited spaces this year so please book early.",
                    datetime: "2020-07-23 09:30:0.000 +00:00",
                    spaces: 14,
                    userId: member.id
                },
                {
                    title: "Urban Fox Hunting (for Photography)",
                    desc: "Capturing our foxy friends at nighttime in an urban setting is a photography challenge. This evening event starts at 9.30pm after dusk. Brian Cladestine will be sharing his top tips for urban photography including advice on camaflage and silent snacks to pack for your nighttime stakeouts.",
                    datetime: "2020-07-30 21:30:0.000 +00:00",
                    spaces: 3,
                    userId: member.id
                }
            ]

            const locations = [
                {
                    lat: 51.48058109880567,
                    lng: -0.10986328125000001
                },
                {
                    lat: 51.482131227525315,
                    lng: -0.10604381561279298
                },
                {
                    lat: 51.483788203409674,
                    lng: -0.11415481567382814
                },
                {
                    lat: 51.48624683086787,
                    lng: -0.10085105895996095
                },
                {
                    lat: 51.484723566435186,
                    lng: -0.10475635528564455
                },
                {
                    lat: 51.480153467817686,
                    lng: -0.10793209075927736
                }
            ]

            await CommunityEvent.bulkCreate(events)
            await Location.bulkCreate(locations)

            const communityEvents = await CommunityEvent.findAll({include: User})
            const communityLocations = await Location.findAll()

            console.log(communityEvents, communityLocations)
            communityEvents.forEach(async (_event, i) => {
                await _event.setLocation(communityLocations[i])
            })
        }
    })
})