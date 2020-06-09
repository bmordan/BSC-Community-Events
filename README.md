# BCS Community Map Project

Clone this repo and install the dependencies. When you are ready to run a local version use the following:

```
npm run dev
```

[Demo Video](https://youtu.be/MXQbFBODAB0)

![community events](https://user-images.githubusercontent.com/4499581/84139652-2ac2d400-aa48-11ea-9043-eda2410b2ba8.png)

# Community Events Ltd

## User Stories

Below are user stories for the two main groups of users _organisers_ and _members_. I am assuming that everyone one starts as a _browser_ and they just look at the events on the map. If a _browser_ wants to attend an event then they have to become a _member_. If a _browser_ wants to create an event they have to become an an _organiser_.

Becoming a _member_ or _organiser_ means that we'll create a user account for them. They will at that point effectively join the community. Users are only a _member_ by virtue of having booked for an event. Users are only an _organiser_ by virtue of having created an event. So a _member_ can also be an _organiser_ if they have both booked an event and created one.

### Browsers

* As a _browser_ I want to see events near me on a map to see if I might be interested in attending an event
* As a _browser_ I want to see how many other community members have booked an event so I can see if there are still spaces
* As a _browser_ I want to see the most popular event so I don't miss out!
* As a _browser_ I want to see the fully booked events so I don't waste time trying to book them
* As a _browser_ I want to be able to become a _member_ so I can attend an event
* As a _browser_ I want to be able to become an _organiser_ so I can create an event

### Members

* As a _member_ I want to book an event so I can attend it and enjoy it with other members
* As a _member_ I want to see all the events I am booked on so I don't forget to attend
* As a _member_ I want to know what the next event is so I don't miss it!

### Organisers

* As an event organiser I want to create events so that other community members can see them on the map
* As an event organiser I want to see all my events so I can keep track of them without being distracted by other events
* As an event organiser I want to see who has booked for my event so I can communicate with them
* As an event organiser I want to see my most popular event so I can focus my resources on that event

All the stories above are summarised in my use-case diagram.

![use case diagram](https://user-images.githubusercontent.com/4499581/83130851-dbd77f00-a0d6-11ea-8446-fd1e21e551fe.png)

## Data Model

![data model](https://user-images.githubusercontent.com/4499581/83131107-3ffa4300-a0d7-11ea-8a6d-ed389a655052.png)

I'm going to store the data in the tables above. I have opted to store a location for a user. In the future it would be great to use geo searching to find events close to the user. But thats too much for this project. However by designing my data model this way, it is open for extension in the future.

## Summary

Whhoo! That was alot of work. I got the data model up and tested in a day, the server with a json API the next day. The frontend took the longest. I got fancy with my design of a slanted slidebar, I didn't really have time to do that. I found dealing with time and dates extra work. To test dates time is dealt with differently in tests you have to mock dates or future proof your code, you can't hard code dates because after a while all your tests would start failing! However I am pleased with the final result.

### Future features

* Local search (requires more fancy database that will deal with geo-search)
* Edit an event (you can't do that in version 1.0.0)
* Forgot password (you are in trouble if you can't remember)
* Better map icons they kind of get a bit lost


