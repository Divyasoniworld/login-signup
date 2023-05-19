const con = require('../../../config/database')
const express = require('express');
const router = express.Router();
const middleware = require('../../../middleware/validator');
const Auth = require('./modal');
const { required } = require('../../../language/en');


router.post('/add_product',(req,res)=>{
    var request = req.body;
    var rules = {
        owner_id : "required",
        title : "required",
        category_id : "required",
        description : "required",
        per_day_price : "required",
        per_week_price : "required",
        per_month_price : "required",
        bond_amount : "required",
        location : "required",
        latitude : "required",
        condition_rating : "required",
        availability_from : "required|date",
        availability_to : "required|date|after:availability_from"
 
    }
 
    var message = {
        required: req.language.required,
    }
 
    //  middleware.decryption(req.body,(request)=>{
        var user_id = req.user_id;
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.add_product(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
  
   })
// })

router.post('/product_edit',(req,res)=>{
    var request = req.body;
    var rules = {
        product_id : "required",
        title : "required",
        category_id : "required",
        description : "required",
        per_day_price : "required",
        per_week_price : "required",
        per_month_price : "required",
        bond_amount : "required",
        condition_rating : "required",
        location : "required",
        latitude : "required",
        condition_rating : "required",
        availability_from : "required|date",
        availability_to : "required|date|after:availability_from"
 
    }
 
    var message = {
        required: req.language.required,
    }
 
    //  middleware.decryption(req.body,(request)=>{
        var user_id = req.user_id;
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.product_edit(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
  
   })
// })

router.post('/product_list',(req,res)=>{
    var request = req.body;
    var user_id = req.user_id; 
    //  middleware.decryption(req.body,(request)=>{
        var user_id = req.user_id;
            Auth.product_list(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
  
   })
// })

router.post('/leased_out',(req,res)=>{
    var request = req.body;
    var user_id = req.user_id; 
    //  middleware.decryption(req.body,(request)=>{
        var user_id = req.user_id;
            Auth.leased_out(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
  
   })
// })

router.post('/nearby',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body
        var user_id = req.user_id
        var page = req.query.page || "0";
        var limit = req.query.limit || "3";
        Auth.nearproduct(request,user_id,page,limit,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        }) 
   })
// })

router.post('/letest',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id
        var page = req.query.page || 0;
        var limit = req.query.limit || 3;


        Auth.latestproduct(request,user_id,page,limit,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        }) 
   })
// })

router.post('/search',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id


        Auth.search(request,req,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        }) 
   })
// })

router.post('/allcategory',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        Auth.allcategory(request,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        }) 
   })
// })

router.post('/product',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            product_id : 'required',
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.product(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/leased_details',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            order_id : "required"


        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.leased_out_details(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/leased_status',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            order_id : 'required',
            status : 'required',
            rating : 'required_if:status,==,1',
            review : 'required_if:status,==,1',
            reason : 'required_if:status,==,0',
            user_id : 'required_if:status,==,1'
        }

        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.leased_status(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/request_details',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
          order_id : 'required'
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.request_details(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/request_status',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        // if (req.query.status == 1) {
        //     var rules = {
        //         order_id : 'required'
        //       }
        // } else {
        //     var rules = {
        //         order_id : 'required',
        //         reason : "required"
        //       }
        // }

        var rules = {
            order_id : 'required',
            status : 'required',
            reason : 'required_if:status,==,0'
        }

        //status : required
          //reason : required_if:status,==,1

        
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.request_status(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/order',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            product_id : 'required',
            pickup_date : 'required|date',
            return_date : 'required|date|after:pickup_date',
            payment_type : 'required|in:card,bank_account',
            card_id : 'required_if:payment_type,card',
            account_id : 'required_if:payment_type,bank_account',
        }
     
        var message = {
            required: req.language.required,
            in : ":attr not valid input"
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.product_order(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })

   router.post('/request_recieved',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var owner_id = req.user_id
     
        Auth.request_received(request,owner_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
      
   })
// })

router.post('/request_sent',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id
     
        Auth.request_sent(request,req,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
      
   })
// })

router.post('/addcard',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            card_type : 'required|in:debit,credit',
            card_number : 'required',
            cvv : 'required|min:3',
            expiry_date : 'required'
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.add_card(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/user_review',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        
        Auth.user_review(request,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
    
   })
// })

router.post('/add-bank-account',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            account_name : "required",
            bsb : "required|size:6",
            account_number : "required|size:16",
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.add_bankAcc(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/chat',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            sender_id : 'required',
            receiver_id : 'required',
            product_id : 'required',
            message : 'required'
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.chat(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/chat_display',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            sender_id : 'required',
            receiver_id : 'required'
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.chat_display(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/faq',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;

        Auth.faq(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
        
   })
// })

router.post('/about',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;

        Auth.about_us(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
        
   })
// })

router.post('/term_con',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;

        Auth.term_and_con(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
        
   })
// })

router.post('/privacy_policy',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;

        Auth.privacy_policy(request,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
        
   })
// })

router.post('/contact_us',(req,res)=>{
    var request = req.body;
    var user_id = req.user_id;
//    middleware.decryption(req.body,(request)=>{

   var rules = {
       email : 'required',
       subject : 'required',
       message : 'required'
       
   }

   var message = {
       required: req.language.required,
   }

   if (middleware.checkValidation(res,request,rules,message)) {
       Auth.contact_us(request,user_id,(code,message,data) => {
           middleware.sendResponse(req, res, code, message ,data)
       })
   } 
// })
})

router.post('/add_review',(req,res)=>{
    var request = req.body;
    var user_id = req.user_id;
//    middleware.decryption(req.body,(request)=>{

   var rules = {
       product_id : 'required',
       listing_accuracy : 'required',
       communication : 'required',
       satisfaction : 'required'
       
   }

   var message = {
       required: req.language.required,
   }

   if (middleware.checkValidation(res,request,rules,message)) {
       Auth.add_review(request,user_id,(code,message,data) => {
           middleware.sendResponse(req, res, code, message ,data)
       })
   } 
// })
})

router.post('/transaction_history',(req,res)=>{
    var request = req.body;
    var user_id = req.user_id;
//    middleware.decryption(req.body,(request)=>{

//    var rules = {
//        product_id : 'required',
//        listing_accuracy : 'required',
//        communication : 'required',
//        satisfaction : 'required'
       
//    }

//    var message = {
//        required: req.language.required,
//    }

//    if (middleware.checkValidation(res,request,rules,message)) {
       Auth.transaction_history(request,user_id,(code,message,data) => {
           middleware.sendResponse(req, res, code, message ,data)
       })
//    } 
// })
})

router.post('/inbox',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        Auth.inbox(request,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
        
   })
// })

router.post('/favourite',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        var rules = {
            product_id : 'required'
        }
     
        var message = {
            required: req.language.required,
        }
     
        if (middleware.checkValidation(res,request,rules,message)) {
            Auth.add_favourites(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        } 
   })
// })

router.post('/alert',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        // if (middleware.checkValidation(res,request,rules,message)) {
            Auth.alert(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        // } 
   })
// })

router.post('/dashboard',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        // if (middleware.checkValidation(res,request,rules,message)) {
            Auth.dashboard(request,user_id,(code,message,data) => {
                middleware.sendResponse(req, res, code, message ,data)
            })
        // } 
   })
// })

router.post('/favourite_list',(req,res)=>{
    // middleware.decryption(req.body,(request)=>{
        var request = req.body;
        var user_id = req.user_id

        Auth.favourite_list(request,user_id,(code,message,data) => {
            middleware.sendResponse(req, res, code, message ,data)
        })
   })
// })

module.exports = router;