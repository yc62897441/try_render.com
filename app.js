const express = require('express')
const app = express()

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
    console.log('req', req)
    console.log('res', res)
    res.send('hello world')
})

app.get('/aaa', (req, res) => {
    console.log('req', req)
    console.log('res', res)
    res.send('hello world aaa')
})

app.get('/api/data', async (req, res) => {
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

const server = app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
