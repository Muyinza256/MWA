const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "muyimoriaty@gmail.com" ,
        pass: 'Faith@256!'
    }
    });

exports.sendEmail = function(toEmail,sub,txt,callback){
    transporter.sendMail({
        from:'muyimoriaty@gmail.com',
        to:toEmail,
        subject:sub,
        text:txt
    },(err,resp) =>{ 
        if(err)
        {
            console.log(err);
        }
        callback(resp);
    })
}