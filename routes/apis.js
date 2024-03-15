// 引入套件
const express = require('express')
const router = express.Router()

const catsData = require('../dummyData/catsData')
const restaurantsData = require('../dummyData/restaurantsData')
const orders = require('../dummyData/order')
const northTaiwanDistricts = require('../dummyData/districts')

router.post('/catslist', async (req, res) => {
    try {
        const offset = req.body.offset || 0
        const limit = offset + (req.body.limit || 10)
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

router.post('/orders', async (req, res) => {
    try {
        // 縣市對照表
        const table = {
            0: '台北市',
            1: '新北市',
            2: '桃園市',
            3: '新竹縣',
            4: '新竹市',
            5: '基隆市',
            6: '宜蘭市',
        }
        const tempOrders = []

        // TODO: 等待正式導入資料庫
        orders.forEach((order) => {
            const obj = {
                ...order,
                city: table[order.city], // 轉化為縣市
                district:
                    northTaiwanDistricts.northTaiwanDistrictsTable[order.city][order.district], // 轉化為行政區
            }
            tempOrders.push(obj)
        })

        res.json({
            status: 'success',
            message: '',
            data: tempOrders,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
router.put('/orders', async (req, res) => {
    try {
        const { orderId, submitType } = req.body
        let isUpdateCompleted = false
        orders.forEach((order) => {
            if (order.id === orderId) {
                // TODO: 等待正式導入資料庫
                order.status =
                    submitType === 'confirmOrder'
                        ? 1
                        : submitType === 'completeOrder'
                        ? 2
                        : submitType === 'cancelOrder'
                        ? 3
                        : ''
                isUpdateCompleted = true
            }
        })
        res.json({
            status: isUpdateCompleted ? 'success' : 'fail',
            message: isUpdateCompleted ? '訂單更新成功' : '訂單更新失敗',
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
