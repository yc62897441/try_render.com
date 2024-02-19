const express = require('express')
const router = express.Router()
const crypto = require('crypto')

const URL = process.env.URL
const MerchantID = process.env.MerchantID
const HashKey = process.env.HashKey
const HashIV = process.env.HashIV
const PayGateWay = 'https://ccore.spgateway.com/MPG/mpg_gateway'
const ReturnURL = URL + '/spgateway/callback?from=ReturnURL'
const NotifyURL = URL + '/spgateway/callback?from=NotifyURL'
const ClientBackURL = URL + '/orders'

function getTradeInfo(Amt, Desc, email) {
    const data = {
        MerchantID: MerchantID, // 商店代號
        RespondType: 'JSON', // 回傳格式
        TimeStamp: Date.now(), // 時間戳記
        Version: 2.0, // 串接程式版本
        MerchantOrderNo: Date.now(), // 商店訂單編號(使用 timestamp時間戳)
        LoginType: 0, // 智付通會員
        OrderComment: 'OrderComment', // 商店備註
        Amt: Amt, // 訂單金額
        ItemDesc: Desc, // 產品名稱
        Email: email, // 付款人電子信箱
        ReturnURL: ReturnURL, // 支付完成返回商店網址
        NotifyURL: NotifyURL, // 支付通知網址/每期授權結果通知
        ClientBackURL: ClientBackURL, // 支付取消返回商店網址
    }

    const chainedData = getDataChain(data)
    const mpg_aes_encrypt = create_mpg_aes_encrypt(chainedData)
    const mpg_sha_encrypt = create_mpg_sha_encrypt(mpg_aes_encrypt)

    const tradeInfo = {
        MerchantID: MerchantID, // 商店代號
        TradeInfo: mpg_aes_encrypt, // 加密後參數
        TradeSha: mpg_sha_encrypt, // 加密參數再雜湊後
        Version: 2.0, // 串接程式版本
        PayGateWay: PayGateWay,
        MerchantOrderNo: data.MerchantOrderNo,
    }
    return tradeInfo
}

function getDataChain(TradeInfo) {
    let results = []
    for (let [key, value] of Object.entries(TradeInfo)) {
        results.push(`${key}=${value}`)
    }
    const chainedData = results.join('&')
    return chainedData
}

function create_mpg_aes_encrypt(chainedData) {
    let encrypt = crypto.createCipheriv('aes256', HashKey, HashIV)
    let enc = encrypt.update(chainedData, 'utf8', 'hex')
    let mpg_aes_encrypt = enc + encrypt.final('hex')
    return mpg_aes_encrypt
}

function create_mpg_sha_encrypt(mpg_aes_encrypt) {
    let sha = crypto.createHash('sha256')
    let plainText = `HashKey=${HashKey}&${mpg_aes_encrypt}&HashIV=${HashIV}`
    const mpg_sha_encrypt = sha.update(plainText).digest('hex').toUpperCase()
    return mpg_sha_encrypt
}

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

router.post('/contribute', (req, res) => {
    const Amt = 'test' // order.amount
    const Desc = '測試：商品資訊'
    const email = 'abc@abc.com'
    const TradeInfo = getTradeInfo(Amt, Desc, email)
    console.log('TradeInfo', TradeInfo)
    res.json({ TradeInfo: TradeInfo })
})

module.exports = router
