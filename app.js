const express = require('express')
const app = express()

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// passport session 驗證
const passport = require('./config/passport')
const session = require('express-session')
app.use(session({ secret: 'fakeJWT_SECRET', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

// 解析請求的資料(body)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// 跨域請求設定
const cors = require('cors')
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
}
app.use(cors(corsOptions))

const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
// const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

const router = require('./routes')
router(app)
module.exports = app
