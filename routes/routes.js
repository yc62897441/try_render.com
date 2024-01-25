const express = require('express')
const router = express.Router()

// const userController = require('../controllers/userController')
// router.get('/signup', userController.signUpPage)

router.get('/aaa', (req, res) => {
    console.log('req', req)
    console.log('res', res)
    res.send('hello world aaa')
})

module.exports = router
