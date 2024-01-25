const express = require('express')
const app = express()

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

app.get('/', (req, res) => {
    console.log('req', req)
    console.log('res', res)
    res.send('hello world')
})

// const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

const router = require('./routes')
router(app)
module.exports = app
