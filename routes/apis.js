// 引入套件
const express = require('express')
const router = express.Router()

const catsData = require('../dummyData/catsData')
const restaurantsData = require('../dummyData/restaurantsData')

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
