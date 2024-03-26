module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        account: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        name: {
            type: Sequelize.STRING,
        },
        age: {
            type: Sequelize.INTEGER,
        },
        gender: {
            type: Sequelize.INTEGER,
        },
        tel: {
            type: Sequelize.STRING,
        },
        city: {
            type: Sequelize.INTEGER,
        },
        district: {
            type: Sequelize.INTEGER,
        },
        address: {
            type: Sequelize.STRING,
        },
        isAdmin: {
            type: Sequelize.STRING,
        },
    })
    return User
}
