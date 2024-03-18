// JWT
// 引入套件
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

//
const JWT_SECRET = process.env.JWT_SECRET || 'fakeJWT_SECRET'

const Axios = require('axios')

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

            // 使用 access_token，向 google API 取回使用者資訊
            const { access_token } = req.body
            const response = await Axios.get(
                `https://www.googleapis.com/drive/v3/about?fields=user&access_token=${access_token}`
            )

            // 透過 google API 回傳的使用者資訊，在系統中找出使用者資訊
            console.log('response.data', typeof response.data, response.data)
            const { kind, displayName, photoLink, me, permissionId, emailAddress } =
                response.data.user
            // response.data 的型態為 object，結構為 {
            //     user: {
            //       kind: 'drive#user',
            //       displayName: 'MR黃',
            //       photoLink: 'https://lh3.googleusercontent.com/a/ACg8ocIvbFQfFcwajk5GIT13rdGiUflDFWFpXP1mToIPJdJMrw=s64',
            //       me: true,
            //       permissionId: '10649345907711710118',
            //       emailAddress: 'gongwuyong34@gmail.com'
            //     }
            //   }
            let user = null
            for (userId in users) {
                if (users[userId].email === emailAddress) user = users[userId]
            }
            console.log('user', user)

            if (!user) {
                return res.json({ status: 'error', message: '發生錯誤' }) // 資安考量，不顯示錯誤的差異訊息
            }

            // 簽發token
            let payload = { id: user.id }
            let token = jwt.sign(payload, JWT_SECRET, { expiresIn: 86400 })
            return res.json({
                status: 'success',
                message: '登入驗證成功',
                token: token,
                user: user,
                googleResponse: JSON.stringify(response.data),
            })
        } catch (error) {
            console.log(error)
        }
    },
}

module.exports = userController
