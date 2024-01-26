const passport = require('passport')
// const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

// 先使用假資料
const users = require('../dummyData/users')
// const db = require('../models')
// const User = db.User

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
const JWT_SECRET = process.env.JWT_SECRET || 'fakeJWT_SECRET'
jwtOptions.secretOrKey = JWT_SECRET

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    const user = users[jwt_payload.id] || null
    return next(null, user)
    // User.findByPk(jwt_payload.id, {
    //     // include: [...]
    // }).then((user) => {
    //     if (!user) return next(null, false)
    //     // ...user可先作先資料處理
    //     return next(null, user)
    // })
})
passport.use(strategy)

module.exports = passport
