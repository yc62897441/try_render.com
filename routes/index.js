// 引入路由
const routes = require('./routes')
const apis = require('./apis')

// passport 驗證
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })

const userController = require('../controllers/userController')

module.exports = (app, passport) => {
    // 無須驗證的路由
    app.post('/auth/signin', userController.signIn)

    // 需要驗證的路由
    app.use('/api', authenticated, apis)
    app.use('/', authenticated, routes)
}
