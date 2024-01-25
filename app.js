const express = require('express')
const app = express()

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
