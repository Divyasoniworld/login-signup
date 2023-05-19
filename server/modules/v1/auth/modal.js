const con = require('../../../config/database');
const comman = require('../../../config/common');
const common = require('../../../config/common');
const emailtemplate = require('../../../config/template');
const middleware = require('../../../middleware/validator')
var globals = require('../../../config/constant');
const { request, response } = require('express');

var Auth = {



    signup : (request, callback) => {
        Auth.checkemu(request,(response)=>{
            if (request.email == response.email) {
                callback('0',{keyword:'rest_keyword_unique_email'},{})
                
            }else if(request.mobile == response.mobile){
                callback('0',{keyword:'rest_keyword_unique_mobile'},{})
            } 
            else {
                var password;
                 middleware.encryption(request.password,(response)=>{
                    password = response
                })
                var userdata = {
                    profile: (request.profile != undefined) ? request.profile : 'default.jpg',
                    first_name: request.first_name,
                    last_name: request.last_name,
                    mobile: request.mobile,
                    email: request.email,
                    password: password,
                    role : "user"

                }

                con.query(`INSERT INTO tbl_user SET ?`,[userdata],(error,result)=>{
                    if (!error) {
                         var user_id = result.insertId;
                                Auth.getuserdetails(user_id,(userdata)=>{
                                    if (userdata == null) {
                                        callback('2',{keyword:'rest_keyword_user_null'},{})
                                   } else {
                                    common.checkUpdateToken(user_id,request,(token)=>{
                                        Auth.getuserdetails(user_id,(userdata)=>{
                                            userdata.token = token;
                                            if (userdata == null) {
                                                callback('2',{keyword:'rest_keyword_user_null'},{})
                                            } else {
                                                callback('1',{keyword:'rest_keyword_user_signup'},userdata)
                                            }
                                        })
                                    })
                                    }
                                });
                       
                    } else {
                        callback('0',{keyword:'rest_keyword_error_message'},{})
                    }
                })
            };
        });

    },

    login : (request, callback) =>{
       Auth.checkemu(request,(response)=>{
        if (request.email == response.email) {
            con.query(`SELECT * FROM tbl_user WHERE email = ? AND is_active = '1' AND is_delete = '0'`,[request.email],(error,result)=>{
                if (!error && result.length > 0) {
                    var cpassword;
                    middleware.encryption(request.password,(response)=>{
                        cpassword = response
                    }) 
    
                    if (cpassword == result[0].password) {
                        Auth.getuserdetails(result[0].id,(userdata)=>{
                            if (userdata == null) {
                                callback('2',{keyword:'rest_keyword_user_null'},{})
                            } else {
        
                                var update_status = {
                                    login_status : 'Online',
                                    logged_in_time : new Date()
                                }
                                console.log(update_status);
                                con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[update_status,result[0].id],(error,response)=>{
                                    comman.checkUpdateToken(result[0].id,request,(token)=>{
                                        userdata.token = token
                                        Auth.getuserdetails(result[0].id,(userdata)=>{
                                            if (userdata == null) {
                                                callback('2',{keyword:'rest_keyword_user_null'},{})
                                            } else {
                                                callback('1',{keyword:'rest_keyword_user_login'},userdata)
                                            }
                                        })
                                    })
                                })
                                
                            }
                        })
                    } else {
                    callback('0',{keyword:'rest_keyword_invalid_password'},{})
                    }
                } else {
                    callback('0',{keyword:'rest_keyword_error_message'},{})}
            })
        } else {
            callback('0',{keyword:'rest_keyword_invalid_email'},{})
        }
       })

    },

    logout : (request,user_id,callback) =>{

        var update_device = {
            token: '',
            device_type : '',
            device_token : ''
        }

        con.query(`UPDATE tbl_device_info SET ? WHERE user_id = ? AND is_active = '1' AND is_delete = '0'`,[update_device,user_id],(error,result)=>{
            if (!error) {
                Auth.getuserdetails(user_id,(userdata)=>{
                    if (userdata == null) {
                        callback('2',{keyword:'rest_keyword_user_null'},{})
                    } else {
                        var updObj = {
                            login_status : "offline"
                        }
                        con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[updObj,user_id],(error,result)=>{
                        if (!error) {
                            Auth.getuserdetails(user_id,(userdata)=>{
                                callback('2',{keyword:'rest_keyword_user_logout'},userdata)
                            })
                        } else {
                            callback('0',{keyword:'rest_keyword_error_message'},{})
                        }
                        })
                    }
                })
            } else {
                callback('0',{keyword:'rest_keyword_error_message'},{})
            }
        })

    },

    // update_user : (request,user_id, callback) => {

    //     var userdata = {
    //         profile: (request.profile != undefined) ? request.profile : "default.jpg"
    //     }

    //     con.query(`UPDATE tbl_user SET ? WHERE id = ? AND is_active = '1' AND is_delete = '0'`,[userdata,user_id],(error,result)=>{
    //         if (!error) {
    //                     Auth.getuserdetails(user_id,(userdata)=>{
    //                         if (userdata == null) {
    //                             callback('2',{keyword:'rest_keyword_user_null'},{})
    //                        } else {
    //                         common.checkUpdateToken(user_id,request,(token)=>{
    //                             Auth.getuserdetails(user_id,(userdata)=>{
    //                                 userdata.token = token;
    //                                 if (userdata == null) {
    //                                      callback('2',{keyword:'rest_keyword_user_null'},{})
    //                                 } else {
    //                                      callback('1',{keyword:'rest_keyword_user_update'},userdata)
    //                                 }
    //                             })
    //                         })
    //                         }
    //                     });
               
    //         } else {
    //             callback('0',{keyword:'rest_keyword_error_message'},{})
    //         }
    //     })
      
    // },

    update_personal_info : (request,user_id, callback) => {

        var userdata = {
            first_name: request.first_name,
            last_name: request.last_name,
            mobile : request.mobile,
            email : request.email,
            location : request.location,
            latitude : request.latitude,
            longitude : request.longitude
        }

        con.query(`UPDATE tbl_user SET ? WHERE id = ? AND is_active = '1' AND is_delete = '0'`,[userdata,user_id],(error,result)=>{
            if (!error) {
                        Auth.getuserdetails(user_id,(userdata)=>{
                            if (userdata == null) {
                                callback('2',{keyword:'rest_keyword_user_null'},{})
                           } else {
                                Auth.getuserdetails(user_id,(userdata)=>{
                                    if (userdata == null) {
                                         callback('2',{keyword:'rest_keyword_user_null'},{})
                                    } else {
                                         callback('1',{keyword:'rest_keyword_update_personal_info'},userdata)
                                    }
                                })
                            }
                        });
               
            } else {
                callback('0',{keyword:'rest_keyword_error_message'},{})
            }
        })
      
    },

    delete_card : (request,user_id, callback) => {

        var userdata = {
           is_active : 0,
           is_delete : 1
        }

        con.query(`UPDATE tbl_card SET ? WHERE id = ? AND is_active = '1' AND is_delete = '0'`,[userdata,user_id],(error,result)=>{
            if (!error) {
                        Auth.getuserdetails(user_id,(userdata)=>{
                            if (userdata == null) {
                                callback('2',{keyword:'rest_keyword_user_null'},{})
                           } else {
                            // common.checkUpdateToken(user_id,request,(token)=>{
                                Auth.getuserdetails(user_id,(userdata)=>{
                                    // userdata.token = token;
                                    if (userdata == null) {
                                         callback('2',{keyword:'rest_keyword_data_null'},{})
                                    } else {
                                         callback('1',{keyword:'card deleted successfully'},userdata)
                                    }
                                })
                            // })
                            }
                        });
               
            } else {
                callback('0',{keyword:'rest_keyword_error_message'},{})
            }
        })
      
    },

     delete_account : (request,user_id, callback) => {

        var userdata = {
           is_active : 0,
           is_delete : 1
        }

        con.query(`UPDATE tbl_bank_account SET ? WHERE id = ? AND is_active = '1' AND is_delete = '0'`,[userdata,user_id],(error,result)=>{
            if (!error) {
                        Auth.getuserdetails(user_id,(userdata)=>{
                            if (userdata == null) {
                                callback('2',{keyword:'rest_keyword_user_null'},{})
                           } else {
                                Auth.getuserdetails(user_id,(userdata)=>{
                                    if (userdata == null) {
                                         callback('2',{keyword:'rest_keyword_data_null'},{})
                                    } else {
                                         callback('1',{keyword:'rest_keyword_account_delete'},userdata)
                                    }
                                })
                            }
                        });
               
            } else {
                callback('0',{keyword:'rest_keyword_error_message'},{})
            }
        })
      
    },

    user_info : (request,user_id,callback)=>{

          if(request.details == "reviews"){

            con.query(`SELECT r.id,u.profile,concat(u.first_name,' ',u.last_name) as name ,r.review,r.rating FROM tbl_owner_rating r 
            JOIN tbl_user u ON r.user_id = u.id
            WHERE r.owner_id = ?`,[user_id],(error,result)=>{

                if (!error && result.length > 0) {
                    callback('1',{keyword : 'rest_keyword_user_reviews'},result);
                } else {
                    callback('0',{keyword : 'something went wrong'},{});
                }
            })

        } else if(request.details == "listing") {

            con.query(`SELECT p.id,p.category_id,(SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = p.id LIMIT 1) as product_image,p.title,p.description,(SELECT IFNULL(ROUND(AVG(r.rating),1),0) FROM tbl_product_condition_rating r WHERE r.product_id = p.id) as rating,p.created_at,p.updated_at FROM tbl_product p WHERE p.owner_id = ? ORDER BY p.created_at DESC;`,[user_id],(error,result)=>{

                if (!error && result.length > 0) {
                    callback('1',{keyword : 'rest_keyword_item_listing'},result);
                } else {
                    callback('0',{keyword : 'something went wrong'},{});
                }
            })

        } else {

            con.query(`SELECT u.id,u.profile,concat(u.first_name,' ',u.last_name) as name,u.location,u.latitude,u.longitude,(SELECT IFNULL(ROUND(AVG(r.rating),1),0) FROM tbl_owner_rating r WHERE r.user_id = u.id) as rating,u.about  FROM tbl_user u WHERE u.id = ?`,[user_id],(error,result)=>{
console.log(error);
                if (!error && result.length > 0) {
                    callback('1',{keyword : 'rest_keyword_user_details'},result);
                } else {
                    callback('0',{keyword : 'something went wrong'},{});
                }
            })
        }

       

    },

    change_password : (request,user_id,callback) =>{
      Auth.getuserdetails(user_id,(data)=>{
        var pass;
        middleware.decryption(data.password,(response)=>{
          pass = response
        })
        if (data == null) {
            callback('2',{keyword : 'rest_keyword_data_null'},{});
        } else {
            if (pass != request.old_password) {
                callback('0',{keyword : "rest_keyword_pass_not_match"},{})
            } else {
                if (request.new_password == pass) {
                    callback('0',{keyword : 'rest_keyword_pass_recentelly'})
                } else {
                    var updpass
                    middleware.encryption(request.new_password,(response)=>{
                        updpass = response
                      })
                    var userData = {
                     password : updpass
                    }
                    con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[userData,user_id],(error,result)=>{
                      if (!error) {
                        Auth.getuserdetails(user_id,(userdata)=>{
                            if (userdata == null) {
                                callback('2',{keyword : 'rest_keyword_data_null'},{});
                            } else {
                                callback('1',{keyword : 'rest_keyword_pass_successfully'},userdata)
                            }
                        })
                      } else {
                        callback('0',{keyword : 'rest_keyword_error_message'},{})
                      }
                    }) 
                }
                
            }
        }
      })
    },

    checkemu: (request, callback) => {
        con.query(`SELECT * FROM tbl_user WHERE email = ? OR mobile = ? AND is_active = '1' AND is_delete = '0'`, [request.email,request.mobile,request.username], (error, result)=> {
            if (!error && result.length > 0) {
                callback(result[0]);
            }else{
                callback(false);
            }
        })
    },

    getuserdetails : (user_id, callback) => {
        con.query(`SELECT u.id,u.role,u.first_name,u.last_name,concat('${globals.BASE_URL}','${globals.user}',u.profile) as image,u.email,u.password,u.mobile,u.login_status,DATE_FORMAT(u.logged_in_time,'%d %M, %Y') as login_time,u.is_forgot,u.forgot_time,ifnull(di.token,'') as token,ifnull(di.device_type,'') as device_type,ifnull(di.device_token,'') as device_token FROM tbl_user u
        LEFT JOIN tbl_device_info di ON di.user_id = u.id
        WHERE u.id = ? AND u.is_active = 1 AND u.is_delete = '0';`,[user_id],(error,result) => {
            var userdata = result[0];
            if (!error && result.length > 0) {
                callback(userdata);
            }else{
                callback(userdata);
            }

        });
    },

    forgotpassword: (request, callback) => {
        con.query("SELECT * FROM tbl_user WHERE email = ? AND is_active = 1 AND is_delete = 0", [request.email], (error, result) => {
            if (!error && result.length > 0) {
                 var data = result[0]
                emailtemplate.forgotpass(data,(forgotpass)=>{
                    common.sendmail(request.email, "Forgot Password", forgotpass, (isSent) => {
                        if (isSent) {

                            var forgotdata = {
                                is_forgot:'1',
                                forgot_time: new Date()
                            }

                            con.query(`UPDATE tbl_user SET ? WHERE id = ?`,[forgotdata,data.id],(error,result)=>{
                                if (!error) {   
                                    Auth.getuserdetails(data.id, (data) => {
                                        if (data == null) {
                                            callback("2", {keyword:"rest_keyword_user_null"}, {})
                                        } else {
                                            callback("1", {keyword:"rest_keyword_password_forget"}, data)
                                        }
                                    })
                                } else {
                                    callback('0', {keyword:'rest_keyword_password_not_forget',content:{}}, {}); 
                                }
                            })

                        } else {
                            callback('0', {keyword:'rest_keyword_email_notfound'}, {});
                        }
                    })
                })
            } else {
                callback('0', {keyword:'rest_keyword_error_message'}, {});
            }
        })

    },

    resetpassword: (request,id, callback) => {
        var password;
        middleware.encryption(request.password,(response)=>{
            password = response
        }) 

        updObj = {
            password : password
        }

        con.query("UPDATE tbl_user SET ? WHERE id = ?", [updObj,id], (error, result) => {
            
            if (!error) {
                Auth.getuserdetails(id, (userdata) => {
                    if (userdata == null) {
                        callback("2", {keyword:'rest_keyword_user_null',content:{}},{})
                    } else {
                        callback("1", {keyword:"rest_keyword_password_forget",content:{}}, userdata)
                    }
                })
            } else {
                callback("0", {keyword:'rest_keyword_error_message',content:{}},{})
            }
        })
    },

}
 module.exports = Auth;