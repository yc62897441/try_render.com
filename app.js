const express = require('express')
const app = express()

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

app.get('/', (req, res) => {
    console.log('========')
    console.log('========')
    console.log('========')
    console.log('get req.body', req.body)
    console.log('get req.params', req.params)
    console.log('get req.query', req.query)

    res.send('hello world')
})

app.post('/', (req, res) => {
    console.log('========')
    console.log('========')
    console.log('========')
    console.log('post req.body', req.body)
    console.log('post req.params', req.params)
    console.log('post req.query', req.query)

    res.json({ b: 'b' })
})

// const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))

const router = require('./routes')
router(app)
module.exports = app
