const express = require('express')
const app = express()

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
    res.send('hello world')
})

// app.listen(PORT, () => {
//     console.log(`App is running on http://localhost:${PORT}`)
// })
const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
