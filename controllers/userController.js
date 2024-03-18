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
            return res.json({ status: 'error', message: '發生錯誤' }) // 資安考量，不顯示錯誤的差異訊息
            return res.json({ status: 'error', message: '請輸入 account 與密碼' })
            return res.status(200).json({ status: 'error', message: '請輸入 account 與密碼' })
        }

        const user = users[account]
        if (!user) {
            return res.json({ status: 'error', message: '發生錯誤' }) // 資安考量，不顯示錯誤的差異訊息
            return res.json({ status: 'error', message: '此 account 尚未註冊' })
            return res.status(200).json({ status: 'error', message: '此 account 尚未註冊' })
        }
        // if (!bcrypt.compareSync(password, user.password)) {
        //     return res.status(401).json({ status: 'error', message: '密碼錯誤' })
        // }
        if (password !== user?.password) {
            return res.json({ status: 'error', message: '發生錯誤' }) // 資安考量，不顯示錯誤的差異訊息
            return res.json({ status: 'error', message: '密碼錯誤' })
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
    googleSignIn: async (req, res) => {
        try {
            console.log('googleSignIn', req.body)

            const response = await Axios.get(
                `https://www.googleapis.com/drive/v3/about?fields=user&access_token=${access_token}`
                // https://www.googleapis.com/drive/v2/files?access_token=access_token
            )
            console.log('response', response)

            return res.json({
                status: 'success',
                message: '登入驗證成功',
                // token: token,
                // user: user,
                response: response,
            })
        } catch (error) {
            console.log(error)
        }
    },
}

module.exports = userController
