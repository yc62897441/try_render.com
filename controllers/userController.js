// JWT
// 引入套件
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

//
const JWT_SECRET = process.env.JWT_SECRET || 'fakeJWT_SECRET'

// 先使用假資料
const users = require('../dummyData/users')

// 簽發 token
const userController = {
    signIn: (req, res) => {
        console.log('signIn', req.body)

        const { account, password } = req.body
        if (!account || !password) {
            return res.json({ status: 'error', message: '請輸入 account 與密碼' })
        }

        const user = users[account]
        if (!user) {
            return res.json({ status: 'error', message: '此 account 尚未註冊' })
        }
        // if (!bcrypt.compareSync(password, user.password)) {
        //     return res.status(401).json({ status: 'error', message: '密碼錯誤' })
        // }
        if (password !== user?.password) {
            return res.status(200).json({ status: 'error', message: '密碼錯誤' })
        }

        // 簽發token
        let payload = { id: user.id }
        let token = jwt.sign(payload, JWT_SECRET, { expiresIn: 86400 })
        return res.json({
            status: 'success',
            message: '登入驗證成功',
            token: token,
            user: user,
        })
    },
}

module.exports = userController
