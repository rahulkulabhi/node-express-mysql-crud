const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    imgUrl: {
        type: Sequelize.STRING,
        allowNull: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Product;


/*
const database = require("../util/database");

const products = [];

module.exports = class Product {

    constructor(title, price, description, imgUrl) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imgUrl = imgUrl;
    }

    addProduct() { // add new products
        return database.execute("INSERT INTO products (title, price, imgUrl, description) VALUES (?, ?, ?, ?)", [this.title, this.price, this.imgUrl, this.description]);
    }

    static getProducts() { // get all products
        return database.execute("SELECT * FROM products");
    }

    static getProduct(id) {
        return database.execute("SELECT * FROM products WHERE id = ?", [id]);
    }
}
*/


