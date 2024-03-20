// 引入套件
const express = require('express')
const router = express.Router()

const { v4: uuidv4 } = require('uuid')

// 資料()
const catsData = require('../dummyData/catsData')
const usersData = require('../dummyData/users')
const restaurantsData = require('../dummyData/restaurantsData')
const orders = require('../dummyData/order')
const northTaiwanDistricts = require('../dummyData/districts')

// 資料庫
const db = require('../models/index') // 引入 /models/index.js 匯出的程式碼(即 sequelize model 定義檔)
const Cat = db.cat
const User = db.user
const Order = db.order

// 呼叫 sync function 將會依 model 定義內容産生資料表，force 參數值為 true 將會重建已存在的資料表
db.sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Drop and Resync Database with { force: true }')
        // initialDbData() // 産生資料表後，呼叫 initialDbData function 為 cats table 新增初始資料
    })
    .catch((err) => {
        console.log(err)
    })
// 新增初始資料
function initialDbData() {
    catsData.forEach((cat) => {
        Cat.create({
            id: cat.id,
            url: cat.url,
            // created_at: new Date(),
            // updated_at: new Date(),
        })
    })

    Object.keys(usersData).forEach((key) => {
        const user = usersData[key]
        User.create({
            id: user.id,
            account: user.account,
            email: user.email,
            password: user.password,
            name: user.name,
            age: user.age,
            gender: user.gender,
            tel: user.tel,
            city: user.city,
            district: user.district,
            address: user.address,
        })
    })
}

router.post('/catslist', async (req, res) => {
    try {
        const offset = req.body.offset || 0
        const limit = offset + (req.body.limit || 10)

        // TODO: 透過時間區間來搜尋 OK 的貓咪
        const timeSpanFormData = req.body.timeSpanFormData
        const startDateTime = `${timeSpanFormData.startDate} ${timeSpanFormData.startTime}`
        const endDateTime = `${timeSpanFormData.endDate} ${timeSpanFormData.endTime}`
        console.log('timeSpanFormData', timeSpanFormData)
        console.log('startDateTime', startDateTime)
        console.log('endDateTime', endDateTime)

        const result = { catsData: catsData.slice(offset, limit) }

        // 將查詢結果回傳給前端
        res.json(result)
    } catch (error) {
        // 處理錯誤情況
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.post('/restaurantlist', async (req, res) => {
    try {
        const offset = req.body.offset || 0
        const limit = offset + (req.body.limit || 10)
        const result = { restaurantsData: restaurantsData.slice(offset, limit) }

        // 將查詢結果回傳給前端
        res.json(result)
    } catch (error) {
        // 處理錯誤情況
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// 取回訂單s
router.post('/orders', async (req, res) => {
    try {
        // console.log('req.body', req.body)
        // 依照 userId 去搜尋，如果不存在 userId 則取回所有
        const userId = req.body.userId || null
        const whereCondition = {}
        if (userId) whereCondition.userId = userId

        const orders = await Order.findAll({ raw: true, where: whereCondition })
        // console.log('orders', orders)
        res.json({
            status: 'success',
            message: '',
            data: orders,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 新增訂單
router.post('/order', async (req, res) => {
    try {
        // console.log('req.body', req.body)
        await Order.create({
            ...req.body,
            id: uuidv4(),
            startDateTime: new Date(req.body.startDateTime),
            endDateTime: new Date(req.body.endDateTime),
        })
        res.json({
            status: 'success',
            message: '',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 編輯訂單
router.put('/order', async (req, res) => {
    try {
        // console.log('req.body', req.body)
        const { id, status } = req.body
        const order = await Order.findByPk(id)
        if (!order) {
            return res.json({
                status: 'fail',
                message: '訂單更新失敗',
            })
        }

        // 更新訂單
        await order.update({
            status: status,
        })
        res.json({
            status: 'success',
            message: '訂單更新成功',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 刪除訂單
router.delete('/order', async (req, res) => {
    try {
        // console.log('req.body', req.body)
        const { id } = req.body
        const order = await Order.findByPk(id)
        if (!order) {
            return res.json({
                status: 'fail',
                message: '訂單刪除失敗',
            })
        }

        // 更新訂單
        await order.destroy()
        res.json({
            status: 'success',
            message: '訂單刪除成功',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get('/data', async (req, res) => {
    try {
        // 假設這是一個非同步操作，例如從資料庫中查詢資料
        const result = await fetchDataFromDatabase()

        // 將查詢結果回傳給前端
        res.json(result)
    } catch (error) {
        // 處理錯誤情況
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 模擬從資料庫中查詢資料的函數
function fetchDataFromDatabase() {
    return new Promise((resolve) => {
        // 假設這裡是一個非同步的操作，例如資料庫查詢
        setTimeout(() => {
            const dataFromDatabase = { key: 'value' }
            resolve(dataFromDatabase)
        }, 1000)
    })
}

module.exports = router
