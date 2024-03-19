module.exports = (sequelize, Sequelize) => {
    const Cat = sequelize.define('cats', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        url: {
            type: Sequelize.STRING,
        },
        // created_at: {
        //     type: Sequelize.DATE,
        // },
        // updated_at: {
        //     type: Sequelize.DATE,
        // },
    })
    return Cat
}
