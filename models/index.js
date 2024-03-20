const db_config = require('../config/db.config.js') // 引入資料庫連結設定檔
const { Sequelize } = require('sequelize') // 引入套件

const sequelize = new Sequelize(db_config.DB, db_config.USER, db_config.PASSWORD, {
    host: db_config.HOST,
    dialect: db_config.dialect,
    operatorsAliases: false,
    pool: {
        max: db_config.pool.max,
        min: db_config.pool.min,
        acquire: db_config.pool.acquire,
        idle: db_config.pool.idle,
    },
}) //  "資料庫名稱"、"User Id"、"Password"、{ "Host Name"、"資料庫類別"(dialect) }
try {
    sequelize.authenticate()
    console.log('Connection has been established successfully.')
} catch (error) {
    console.error('Unable to connect to the database:', error)
}

const db = {}
db.Sequelize = Sequelize
db.sequelize = sequelize
db.user = require('./user.model.js')(sequelize, Sequelize)
db.cat = require('./cat.model.js')(sequelize, Sequelize)
db.order = require('./order.model.js')(sequelize, Sequelize)

// 設定一對多(還沒確定可否 work)
db.user.hasMany(db.order, { foreignKey: 'userId' })
db.order.belongsTo(db.user, { foreignKey: 'userId' })

// 設定兩資料表的對應關係（多對多，所以會多出一個新的表 cat_order）
db.cat.belongsToMany(db.order, {
    through: 'cat_order',
    foreignKey: 'catId',
    otherKey: 'orderId',
})
db.order.belongsToMany(db.cat, {
    through: 'cat_order',
    foreignKey: 'orderId',
    otherKey: 'catId',
})

module.exports = db
