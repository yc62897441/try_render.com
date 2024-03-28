// 引入套件
const express = require('express')
const router = express.Router()

const { v4: uuidv4 } = require('uuid')

// 使用 notion db
const { Client } = require('@notionhq/client')
const fetch = require('node-fetch')

// [note] node-csv 筆記
// https://pjchender.dev/npm/npm-node-csv/
// 使用 Stream
const csv = require('csv')
const path = require('path')
const fs = require('fs')
const fsPromises = fs.promises

// 資料()
const catsData = require('../dummyData/catsData')
const usersData = require('../dummyData/users')
const restaurantsData = require('../dummyData/restaurantsData')
const orders = require('../dummyData/order')
const northTaiwanDistricts = require('../dummyData/districts')

// 資料庫
const { Op } = require('sequelize')
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

        const { startDate, startTime, endDate, endTime } = req.body.timeSpanFormData
        const notAvailableCatIdsTable = {} // 儲存時間上不允許的貓咪的 ids

        // 過濾出時間上是允許的 cats (3步驟)
        if (startDate && startTime && endDate && endTime) {
            // 有指定時間區間，須執行步驟 1、2
            // 1.透過時間區間來搜尋時間有重疊的訂單
            const startDateTime = `${startDate} ${startTime}`
            const endDateTime = `${endDate} ${endTime}`
            let whereCondition = {
                [Op.or]: [
                    {
                        [Op.and]: [
                            { startDateTime: { [Op.gte]: new Date(startDateTime) } },
                            { startDateTime: { [Op.lt]: new Date(endDateTime) } },
                        ],
                    },
                    {
                        [Op.and]: [
                            { endDateTime: { [Op.gt]: new Date(startDateTime) } },
                            { endDateTime: { [Op.lte]: new Date(endDateTime) } },
                        ],
                    },
                    {
                        [Op.and]: [
                            { startDateTime: { [Op.lt]: new Date(startDateTime) } },
                            { endDateTime: { [Op.gt]: new Date(endDateTime) } },
                        ],
                    },
                ],
            }
            const orders = await Order.findAll({
                where: whereCondition,
                // raw: true,
            })

            // 2.透過重疊的訂單，找出有哪些 catIds 是時間上有衝突的，並且把有衝突的貓咪 ids 存到 notAvailableCatIdsTable 之中
            const ordersWithCats = await Promise.all(
                orders.map(async (order) => {
                    const cats = await order.getCats()
                    const catIds = cats.map((cat) => cat.id)
                    return {
                        ...order.dataValues,
                        startDateTime: new Date(order.startDateTime).toString(),
                        endDateTime: new Date(order.endDateTime).toString(),
                        catIds,
                    }
                })
            )
            ordersWithCats.forEach((order) => {
                order.catIds.forEach((catId) => {
                    notAvailableCatIdsTable[catId] = true
                })
            })
        }
        // 沒有指定時間區間，直接執行驟 3
        // 3.透過有衝突的 catIds，過濾出時間上是允許的 cats
        const cats = await Cat.findAll({
            raw: true,
        })
        let catsAvailable = null
        // 如果 notAvailableCatIdsTable 非空物件(表示存在需要排除的 catIds)，才需要額外做 filter
        if (Object.keys(notAvailableCatIdsTable)?.length > 0) {
            catsAvailable = cats.filter((cat) => !notAvailableCatIdsTable[cat.id])
        } else {
            catsAvailable = cats
        }

        // 將查詢結果回傳給前端
        const result = { catsData: catsAvailable.slice(offset, limit) }
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

        const orders = await Order.findAll({
            // raw: true,
            where: whereCondition,
        })
        // 使用 Promise.all() 等待所有訂單的貓咪關聯查詢完成
        const ordersWithCats = await Promise.all(
            orders.map(async (order) => {
                const cats = await order.getCats()
                const catIds = cats.map((cat) => cat.id) // 提取貓咪的 ID
                return { ...order.dataValues, catIds } // 返回包含貓咪 ID 的訂單物件
            })
        )
        // console.log('Orders with cat IDs:', ordersWithCats)

        res.json({
            status: 'success',
            message: '',
            data: ordersWithCats,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 取回訂單
router.post('/order/id', async (req, res) => {
    try {
        // console.log('req.body', req.body)
        const { orderId } = req.body

        // 獲取訂單
        const order = await Order.findByPk(orderId)
        if (!order) throw new Error('Order not found')

        // 使用 get 方法獲取與訂單關聯的貓咪
        const cats = await order.getCats()
        const catIds = cats.map((cat) => cat.id) // 提取貓咪的 ID
        const orderWithCats = {
            ...order.dataValues,
            catIds,
        }
        // console.log('orderWithCats', orderWithCats)

        res.json({
            status: 'success',
            message: '',
            data: orderWithCats,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// 新增訂單
router.post('/order', async (req, res) => {
    try {
        console.log('req.body', req.body)
        const {
            userId,
            orderPhone,
            orderAddress,
            startDateTime,
            endDateTime,
            totalPrice,
            status,
            catId,
            // elseInfo,
        } = req.body

        const order = await Order.create({
            id: uuidv4(),
            userId: userId,
            orderPhone: orderPhone,
            orderAddress: orderAddress,
            startDateTime: new Date(startDateTime),
            endDateTime: new Date(endDateTime),
            totalPrice: totalPrice,
            status: status,
        })
        // 建立訂單與貓咪的關聯
        await order.setCats(catId)

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

// 讀取 order csv 並且寫入到資料庫
router.post('/readOrderCSVtoDB', async (req, res) => {
    try {
        const cat_orderCSV = await readAndParseCSV('../db/cat_order.csv')
        const ordersCSV = await readAndParseCSV('../db/orders.csv')

        const ordersHead = ordersCSV.slice(0, 1)
        const ordersContents = ordersCSV.slice(1)

        const cat_orderContents = cat_orderCSV.slice(1)

        ordersContents.forEach(async (content) => {
            const obj = {}
            content.forEach((item, index) => {
                obj[ordersHead[0][index]] = item
            })
            const order = await Order.create(obj)

            const catId = []
            cat_orderContents.forEach((cat_orderContent) => {
                // cat_orderCSV 是 Cat 與 Order 兩張表多對多關係的中間表，cat_orderContent[3] 紀錄的是 orderId，cat_orderContent[2] 紀錄的是 catId
                if (cat_orderContent[3] === content[0]) catId.push(cat_orderContent[2])
            })

            // 建立訂單與貓咪的關聯
            await order.setCats(catId)
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
async function readAndParseCSV(filePath) {
    try {
        // STEP 1: 讀取 CSV 檔
        const inputFilePath = path.resolve(__dirname, filePath)
        const input = await fsPromises.readFile(inputFilePath)

        // STEP 2：建立讀出 CSV 用的陣列和 parser
        const output = []
        const parser = csv.parse({
            delimiter: ',',
        })

        // STEP 3-1：建立對應事件 - 讀取資料
        parser.on('readable', function () {
            let record
            while ((record = parser.read())) {
                output.push(record)
            }
        })

        // STEP 3-2：錯誤處理
        parser.on('error', function (err) {
            console.error(err.message)
        })

        // STEP 3-3：取得最後 output 的結果
        parser.on('end', function () {
            // console.log('output', output)
        })

        // STEP 4：放入預備讀取的內容
        parser.write(input)

        // STEP 5：關閉 readable stream
        parser.end()

        return output
    } catch (error) {
        console.log('error', error)
    }
}

// 使用 fetch 來操作 notion db，需要給 fetch 帶 headers
const headers = {
    Authorization: `Bearer ${process.env.NOTION_DB_SECRET}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2021-08-16',
}
// 讀取 Notion DB 資料
router.post('/notion_db', async (req, res) => {
    try {
        console.log('req.body', req.body)
        const notion = new Client({ auth: process.env.NOTION_DB_SECRET }) // Initializing a client
        const response = await notion.databases.query({
            database_id: process.env.NOTION_WORKSPACE_DB_DATABASE,
            filter: {
                property: 'userId',
                rich_text: {
                    contains: '002',
                },
            },
        })
        console.log('response', response)

        // 使用 fetch 取回 notion database，資料庫的訊息
        // const response = await fetch(
        //     `https://api.notion.com/v1/databases/${process.env.NOTION_WORKSPACE_DB_DATABASE}/`,
        //     {
        //         method: 'GET',
        //         headers,
        //     }
        // )

        // 使用 fetch 取回所有資料
        // const fetchResponse = await fetch(
        //     `https://api.notion.com/v1/databases/${process.env.NOTION_WORKSPACE_DB_DATABASE}/query`,
        //     {
        //         method: 'POST',
        //         headers,
        //         body: JSON.stringify({
        //             // 可以新增查詢參數，如篩選條件等
        //             filter: {
        //                 property: 'userId',
        //                 rich_text: {
        //                     contains: '002',
        //                 },
        //             },
        //         }),
        //     }
        // )
        // console.log('fetchResponse', fetchResponse)
        // const response = await fetchResponse.json()
        // console.log('fetchResponse.json()', response)

        // 使用 fetch 取回單筆資料
        // const fetchResponse = await fetch(
        //     `https://api.notion.com/v1/pages/908228ef-8304-4774-94c9-1b2ca1495b82`,
        //     {
        //         method: 'GET',
        //         headers: headers,
        //     }
        // )
        // console.log('fetchResponse', fetchResponse)
        // const response = await fetchResponse.json()
        // console.log('fetchResponse.json()', response)

        res.json({
            status: 'success',
            message: 'notion_db',
            results: response?.results || response,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 新增一筆資料到 Notion DB
router.post('/add_notion_db', async (req, res) => {
    try {
        console.log('req.body', req.body)
        const data = { ...req.body }

        const notion = new Client({ auth: process.env.NOTION_DB_SECRET }) // Initializing a client
        const newPage = await notion.pages.create(data)
        console.log('newPage', newPage)

        // 使用 fetch 來新增資料
        // const page = await fetch(`https://api.notion.com/v1/pages`, {
        //     method: 'POST',
        //     headers: headers,
        //     body: JSON.stringify(data),
        // })

        res.json({
            status: 'success',
            message: 'notion_db',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 更新一筆資料到 Notion DB
router.post('/put_notion_db', async (req, res) => {
    try {
        console.log('req.body', req.body)
        const data = { ...req.body }
        const pageId = data.pageId
        const properties = data.properties

        const notion = new Client({ auth: process.env.NOTION_DB_SECRET }) // Initializing a client
        const newPage = await notion.pages.update({ page_id: pageId, properties: properties })
        console.log('newPage', newPage)

        // 使用 fetch 來更新資料
        // const page = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        //     method: 'PATCH',
        //     headers: headers,
        //     body: JSON.stringify(data),
        // })

        res.json({
            status: 'success',
            message: 'notion_db',
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
// 刪除一筆資料到 Notion DB
router.post('/delete_notion_db', async (req, res) => {
    try {
        console.log('req.body', req.body)
        const data = { ...req.body }
        const pageId = data.pageId

        const notion = new Client({ auth: process.env.NOTION_DB_SECRET }) // Initializing a client
        const newPage = await notion.pages.update({ page_id: pageId, archived: true })
        console.log('newPage', newPage)

        // 使用 fetch 來刪除資料
        // const page = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        //     method: 'PATCH',
        //     headers: headers,
        //     body: JSON.stringify({ archived: true }),
        // })

        res.json({
            status: 'success',
            message: 'notion_db',
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
