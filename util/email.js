const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
module.exports = nodemailer.createTransport(
    nodemailerSendgrid({
        apiKey: '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'
    })
);
