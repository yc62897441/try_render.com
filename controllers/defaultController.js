// 引入套件
const express = require('express')
const router = express.Router()

// 行政區資料
const northTaiwanDistricts = require('../dummyData/districts')

// 取得北台灣行政區資料
router.get('/userController', async (req, res) => {
    try {
        res.json({
            status: 'success',
            message: '',
            data: northTaiwanDistricts.northTaiwanDistrictsArray,
        })
    } catch (error) {
        // 處理錯誤情況
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

module.exports = router
