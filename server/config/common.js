const { response } = require('express');
var nodemailer = require('nodemailer');
var con = require('./database');
var common = {
  
 sendmail: (to_email,subject,massage,callback) =>{

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMIAL_PASSWORD
        }
      });
      
      var mailOptions = {
        from: process.env.EMAIL_ID,
        to: to_email,
        subject: subject,
        html: massage
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) { 
            callback(false);
        } 
        else {
            callback(true);
        }
      });
 },

 checkUpdateToken : (user_id,request,callBack)=>{

  var randomtoken = require('rand-token').generator();
  var usersession = randomtoken.generate(64,'0123456789abcdefghijklmnopqrstuvwxyz')

con.query(`SELECT * FROM tbl_device_info WHERE user_id = ?`,[user_id],(error,result)=>{
if (!error && result.length > 0) {
  var deviceparams = {
    device_type: (request.device_type != undefined) ? request.device_type : 'A',
    device_token: (request.device_token != undefined) ? request.device_token : '0',
    token: usersession
  }

  con.query(`UPDATE tbl_device_info SET ? WHERE user_id = ?`,[deviceparams,user_id],(err,response)=>{
    callBack(usersession);
  })

} else {
  
  var deviceparams = {
    device_type: request.device_type,
    device_token: request.device_token,
    token: usersession,
    user_id: user_id
  }
  con.query(`INSERT INTO tbl_device_info SET ?`,[deviceparams],(err,response)=>{
    callBack(usersession);
  })

}
})

 },

 randomotp : ()=>{
  // return Math.floor(1000 + Math.random() * 9000);
  return '1234';
 },

 resendotp : ()=>{
  // return Math.floor(1000 + Math.random() * 9000);
  return '5678';
 },



}

module.exports = common;