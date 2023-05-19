const con = require('../../../config/database')
const express = require('express');
const router = express.Router();
const middleware = require('../../../middleware/validator');
const Auth = require('./modal');
const multer = require('multer');
const path = require('path')


//upload image

var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
      callBack(null, './public/user/')     
    },
    filename: (req, file, callBack) => {
      callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var upload = multer({
    storage: storage
  }).single('image')

  router.post('/upload', upload, (req, res) => {
    if (!req.file) {
      return res.status(400).send('No files were uploaded.');
    }
    con.query(`SELECT * FROM tbl_user WHERE id = 1`,(error,result)=>{
        res.send(result);
    })
  });

//   router.post('/userimage',(req,res)=>{
//     upload(req,res,(error)=>{
//         if (!error) {
//         middleware.sendResponse(req, res, "1", {keyword:"upload successful",content:{}} ,{image:req.file.filename});
//         } else {
//             middleware.sendResponse(req, res, "0", {keyword:"failed to upload",content:{}} ,{});
//         }
//     })
//   })

router.post('/signup',(req,res)=>{

    // middleware.decryption(req.body,(request)=>{
       var request = req.body;
    var rules = {
        profile: '',
        first_name: 'required',
        last_name: 'required',
        mobile: 'required',
        email: ['required','email'],
        password: 'required',
        device_type: 'required|in:A,I,W',
        device_token: 'required'
    }

    var message = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.signup(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 

//  })

})

router.post('/login',(req,res)=>{
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  var token =  Math.random() + 1000 * 9000 
    console.log(token);
    var request = req.body;
    //  middleware.decryption(req.body,(request)=>{

    
    var rules = {
        email : 'required|email',
        password:'required',
        device_type : 'required',
        device_token : 'required'
    }

    var message = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res,request,rules,message)) {
        Auth.login(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    } 
//  })

})

router.post('/update_personal_info', (req, res) => {

    
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var user_id = req.user_id;

    var rules = {
        first_name:'required',
        last_name: 'required',
        mobile : 'required',
        email : 'required',
        location : 'required',
        latitude : 'required',
        longitude : 'required'
        
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.update_personal_info(request,user_id,(code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }

    //  })

})


router.post('/user_info', (req, res) => {

    
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var user_id = req.user_id;

    var rules = {
        details : "" 
        
    }

    var message = {
        required: req.language.required,
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.user_info(request,user_id,(code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }

    //  })

})

router.post('/change_password', (req, res) => {

    
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var user_id = req.user_id;

    var rules = {
        old_password : "required",
        new_password  : "required",
        confirm_password : "required|same:new_password"
        
    }

    var message = {
        required: req.language.required,
        same : "new password and confirm password are not match"
    }

    if (middleware.checkValidation(res, request, rules, message)) {
        Auth.change_password(request,user_id,(code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    }

    //  })

})

router.post('/delete_card', (req, res) => {

    
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var user_id = req.user_id;



 
    // if (middleware.checkValidation(res, request, rules, message)) {
        Auth.delete_card(request,user_id,(code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    // }

    //  })

})

router.post('/delete_account', (req, res) => {

    
    var request = req.body;
    // middleware.decryption(req.body,(request)=>{
    var user_id = req.user_id;



 
    // if (middleware.checkValidation(res, request, rules, message)) {
        Auth.delete_account(request,user_id,(code, message, data) => {
            middleware.sendResponse(req, res, code, message, data)
        })
    // }

    //  })

})

router.post('/logout',(req,res)=>{
    //  var request = req.body;
    middleware.decryption(req.body,(request)=>{
        var user_id = req.user_id;
        Auth.logout(request,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
  
})
})


router.get('/forgot/:id',(req,res)=>{
    var id = req.params.id;
     con.query(`SELECT * FROM tbl_user WHERE id = ?`,[id],(error,result)=>{
         var currtime = new Date();
         var timediff = currtime.getMinutes() - result[0].forgot_time.getMinutes();
         if (!error && result.length > 0) {
             var data = result[0];
              var is_forgot = data.is_forgot;
             if (is_forgot == 1 && timediff < 2) {
                res.render('forgot.html',{id: req.params.id})
            } else {
                con.query(`UPDATE tbl_user SET is_forgot = '0'`,(error,result)=>{
                    res.send("Invalid link")
                })
            }
        } else {
            res.send("Invalid link")
            
        }
     })
        

})

router.post('/forgoted/:id',(req,res)=>{

     var request = req.body;
     var id = req.params.id;

Auth.getuserdetails(id,(userdata)=>{
    if (userdata == null) {
        middleware.sendResponse(req, res, code, massage, data);
    } else {
        if (userdata.is_forgot == 1) {
            Auth.resetpassword(request,id, (code, massage, data) => {
                     con.query(`UPDATE tbl_user SET is_forgot = '0'`,(error,result)=>{
                        res.render("result.html" ,{data:data})
                     })
            });
        } else {
            res.send("Invalid!!")
        }
    }

})

})

 router.post('/forgotpassword',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
     var request = req.body;

    var rules = {
        email: ['required','email']
    }

    var massage = {
        required: req.language.required,
        email: req.language.email
    }

    if (middleware.checkValidation(res,request,rules,massage)) {
        Auth.forgotpassword(request, (code, massage, data) => {
            middleware.sendResponse(req, res, code, massage, data);
        });
    }
})
//  })





module.exports = router;