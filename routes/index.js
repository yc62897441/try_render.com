// passport 驗證
const passport = require('../config/passport')
const authenticated = passport.authenticate('jwt', { session: false })

// 引入路由
const routes = require('./routes')
const apis = require('./apis')
const userController = require('../controllers/userController') // user 權限相關
const defaultController = require('../controllers/defaultController') // 不須權限的系統使用資料

module.exports = (app, passport) => {
    // 無須驗證的路由
    app.post('/auth/signin', userController.signIn)
    app.use('/default', defaultController)

    // 需要驗證的路由
    app.use('/api', authenticated, apis)
    app.use('/', authenticated, routes)
}
