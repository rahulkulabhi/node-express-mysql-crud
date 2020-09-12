const Product = require("../models/product");

exports.productsList = (request, response, next) => {
    Product.findAll()
    .then((products) => {
        // throw new Error("testing error!");
        response.render('products/list', {
            pageTitle: 'Product List',
            products: products,
            url: '/products'
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    /*
    Product.getProducts()
    .then(([rows, data]) => {
        response.render('products/list', {
            pageTitle: 'Product List',
            products: rows,
            url: '/products'
        });
    })
    .catch(err => {console.log(err);});
    */
};

exports.add = (request, response, next) => {
    if(request.method == "GET"){
        response.render('products/add', {
            pageTitle: "Add Product!",
            url: '/products/add'
        });
    } else if (request.method == "POST") {
        // console.log(request.body);
        // console.log(request.session.user);
        /*
        Product.create({
            title: request.body.title,
            price: request.body.price,
            description: request.body.description,
            imgUrl: request.body.imgUrl,
            userId: request.session.user.id
        })
        */
        request.user.createProduct({
            title: request.body.title,
            price: request.body.price,
            description: request.body.description,
            imgUrl: request.body.imgUrl
        })
        .then((result) => {
            // console.log(result);
            response.redirect("/products/add");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
        /*
        const product = new Product(request.body.title, request.body.price, request.body.description, request.body.imgUrl);
        product
        .addProduct()
        .then(() => {
            response.redirect("/products/add");
        })
        .catch(err => {console.log(err);});
        */
    }
};

exports.getProduct = (request, response, next) => {
    const id = request.params.id;
    Product.findByPk(id)
    .then((product) => {
        response.render('products/details', {
            pageTitle: product.dataValues.title + " - Details!",
            url: '/products/' + product.dataValues.id,
            product: product.dataValues
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.editProduct = (request, response, next) => {
    const id = request.params.id;
    if(request.method == "GET"){
        Product.findByPk(id)
        .then((product) => {
            response.render('products/edit', {
                pageTitle: product.dataValues.title + " - Edit!",
                url: '/products/edit/' + product.dataValues.id,
                product: product.dataValues
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    } else if(request.method == "POST"){
        //console.log(request.body);
        Product.update({
            title: request.body.title,
            price: request.body.price,
            imgUrl: request.body.imgUrl,
            description: request.body.description,
        },{
            where: {
                id: id
            }
        })
        .then((result) => {
            // console.log(result);
            response.redirect("/products/" + id);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
    }
};

exports.delete = (request, response, next) => {
    const id = request.params.id;
    Product.findByPk(id)
    .then((product) => {
        return product.destroy();
    })
    .then((result) => {
        // console.log("Product deleted of id: " + id);
        response.redirect("/products/");
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};
