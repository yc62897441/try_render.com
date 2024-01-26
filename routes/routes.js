const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    // console.log('get req.body', req.body)
    // console.log('get req.params', req.params)
    // console.log('get req.query', req.query)

    // JWT驗證後從資料庫撈出的 req.user
    // 這邊的資料屬性要和 /config/passport.js 定義的一致
    console.log('get req.user', req.user)

    // res.send('hello world')
    res.json({ key: 'value' })
})

router.post('/', (req, res) => {
    res.json({ b: 'b' })
})

module.exports = router
