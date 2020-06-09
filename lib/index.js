const { Sequelize, Model, DataTypes } = require('sequelize')
const path = require('path')
const crypto = require('crypto')
const sequelize = process.env.NODE_ENV === 'test'
    ? new Sequelize('sqlite::memory:', null, null, {dialect: 'sqlite'})
    : new Sequelize({dialect: 'sqlite', storage: path.join(__dirname, 'data.db')})
const clearDB = sequelize.drop

class User extends Model {}
class CommunityEvent extends Model {}
class User_CommunityEvent extends Model {}
class Location extends Model {}

User.generateSalt = function () {
    return crypto.randomBytes(16).toString('base64')
}

User.encryptPassword = function(plainText, salt) {
    return crypto
        .createHash('RSA-SHA256')
        .update(plainText)
        .update(salt)
        .digest('hex')
}

User.prototype.correctPassword = function(enteredPassword) {
    return User.encryptPassword(enteredPassword, this.salt()) === this.password()
}

const setSaltAndPassword = user => {
    if (user.changed('password')) {
        user.salt = User.generateSalt()
        user.password = User.encryptPassword(user.password(), user.salt())
    }
}

User.init({
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  password: {
        type: Sequelize.STRING,
        get() {
            return () => this.getDataValue('password')
        }
  },
  salt: {
        type: Sequelize.STRING,
        get() {
            return() => this.getDataValue('salt')
        }
  }
}, { sequelize, modelName: 'user' })

User.beforeCreate(setSaltAndPassword)
User.beforeUpdate(setSaltAndPassword)

CommunityEvent.init({
    title: DataTypes.STRING,
    desc: DataTypes.STRING,
    datetime: DataTypes.DATE,
    spaces: DataTypes.INTEGER
}, { sequelize, modelName: 'event' })

User_CommunityEvent.init({}, { sequelize, modelName: 'user_event' })

Location.init({
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT
}, { sequelize, modelName: 'location' })

User.hasOne(Location)
User.belongsToMany(CommunityEvent, {through: User_CommunityEvent})
CommunityEvent.belongsToMany(User, {through: User_CommunityEvent})
CommunityEvent.hasOne(Location)
CommunityEvent.belongsTo(User)

module.exports = cb => {
    sequelize.sync()
        .then(() => {
            return cb(null, { User, CommunityEvent, Location, clearDB }) 
        })
        .catch(cb)
}
