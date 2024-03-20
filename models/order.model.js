module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('orders', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false,
            // autoIncrement: true,
            // type: Sequelize.INTEGER
        },
        userId: {
            type: Sequelize.STRING,
        },
        orderPhone: {
            type: Sequelize.STRING,
        },
        orderAddress: {
            type: Sequelize.STRING,
        },
        startDateTime: {
            type: Sequelize.DATE,
        },
        endDateTime: {
            type: Sequelize.DATE,
        },
        totalPrice: {
            type: Sequelize.INTEGER,
        },
        status: {
            type: Sequelize.INTEGER,
        },
    })
    return Order
}
