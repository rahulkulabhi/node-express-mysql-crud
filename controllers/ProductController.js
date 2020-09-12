const Product = require("../models/product");
const { validationResult } = require('express-validator');

exports.productsList = (request, response, next) => {
    Product.findAll()
    .then((products) => {
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
};

exports.add = (request, response, next) => {
    if(request.method == "GET"){
        let errmsg = request.flash('error');
        if (errmsg.length > 0) {
            errmsg = errmsg[0];
        } else {
            errmsg = null;
        }
        response.render('products/add', {
            pageTitle: "Add Product!",
            url: '/products/add',
            errorMsg: errmsg,
            oldValues: { 
                title: '', 
                price: '',
                description: ''
            },
            validationErrors: []
        });
    } else if (request.method == "POST") {
        //console.log(request.file);
        const errors = validationResult(request);
        if(!errors.isEmpty()) {
            response.status(422).render('products/add', {
                pageTitle: "Add Product!",
                url: '/products/add',
                errorMsg: errors.array()[0].msg,
                oldValues: { 
                    title: request.body.title, 
                    price: request.body.price,
                    description: request.body.description
                },
                validationErrors: errors.array()
            });
        } else {
            let imgUrl = '';
            if(!request.file){
                imgUrl = '';
            }else{
                imgUrl = request.file.path;
            }
            request.user.createProduct({
                title: request.body.title,
                price: request.body.price,
                description: request.body.description,
                imgUrl: imgUrl // request.body.imgUrl
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
        }
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
    Product.findByPk(id)
    .then((product) => {
        if (!product){
            return response.redirect('/products');
        }
        if(request.method == "GET"){
            let errmsg = request.flash('error');
            if (errmsg.length > 0) {
                errmsg = errmsg[0];
            } else {
                errmsg = null;
            }
            return response.render('products/edit', {
                pageTitle: product.dataValues.title + " - Edit!",
                url: '/products/edit/' + product.dataValues.id,
                product: product.dataValues,
                errorMsg: errmsg,
                oldValues: { 
                    title: '', 
                    price: '',
                    description: ''
                },
                validationErrors: []
            });
        } else if (request.method == "POST") {
            const errors = validationResult(request);
            if(!errors.isEmpty()) {
                return response.render('products/edit', {
                    pageTitle: product.dataValues.title + " - Edit!",
                    url: '/products/edit/' + product.dataValues.id,
                    product: product.dataValues,
                    errorMsg: errors.array()[0].msg,
                    oldValues: { 
                        title: request.body.title, 
                        price: request.body.price,
                        description: request.body.description
                    },
                    validationErrors: errors.array()
                 });
            }
            product.title= request.body.title;
            product.price= request.body.price;
            if (request.file)
                product.imgUrl= request.file.path; //request.body.imgUrl,
            product.description= request.body.description;
            product.save()
            .then(result => {
                response.redirect('/products/edit/' + id)
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
        }
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
    
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
