var asyncLoop = require('node-async-loop');
const globals = require('../../../config/constant');
const { request } = require('express');
const e = require('express');
var randomtoken = require('rand-token').generator();
const common = require('../../../config/common');
const emailtemplate = require('../../../config/template');
const user = require('../auth/modal')

con = require('../../../config/database');

var Auth = {

    add_product: (request, user_id, callback) => {

        var postData = {
            owner_id : request.owner_id,
            title: request.title,
            category_id: request.category_id,
            description: request.description,
            per_day_price: request.per_day_price,
            per_week_price: request.per_week_price,
            per_month_price: request.per_month_price,
            bond_amount: request.bond_amount,
            location: request.location,
            latitude: request.latitude,
            longitude: request.longitude,
            condition_rating: request.condition_rating,
            availability_from: request.availability_from,
            availability_to: request.availability_to

        }

        con.query(`INSERT INTO tbl_product SET ?`, [postData], (error, result) => {
            if (!error) {
                if (request.images != undefined && request.media_type != undefined) {
                    asyncLoop(request.images, (item, next) => {
                        var images = {
                            product_id: result.insertId,
                            media_type: request.media_type,
                            media: item
                        }
                        con.query(`INSERT INTO tbl_product_image SET ?`, [images], (error, response) => {
                            if (!error) {
                                next()
                            } else {
                                next()
                            }
                        })
                    }, () => {
                        Auth.addproduct_details(result.insertId, (data) => {
                            callback('1', { keyword: 'rest_keyword_item_add' }, data)
                        })
                    })
                } else {
                    Auth.addproduct_details(result.insertId, (data) => {
                        callback('1', { keyword: 'rest_keyword_item_add' }, data)
                    })
                }
            } else {
                callback('0', { keyword: 'rest_keyword_error_message' }, {})
            }
        })
    },

    product_list : (request,user_id,callback) => {

        con.query(`SELECT * FROM tbl_user WHERE id = ?`,[user_id],(error,result)=>{
            if (!error && result.length > 0) {

                var latitude = result[0].latitude;
                var longitude = result[0].longitude;

                con.query(`SELECT p.id,(SELECT pi.media FROM tbl_product_image pi WHERE p.id = pi.product_id ORDER BY pi.created_at DESC LIMIT 1) as image,p.title,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,
                (SELECT IFNULL(ROUND(AVG(pr.rating),1),0) FROM tbl_product_condition_rating pr WHERE p.id = pr.product_id) as product_rating,p.location,p.latitude,p.longitude,p.description,p.per_day_price, 
                concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(p.latitude) - ABS(${latitude})) * PI()/180 / 2), 2) + COS(ABS(p.latitude) * PI()/180) * COS(ABS(${latitude}) * PI()/180) * POWER(SIN((ABS(p.longitude) - ABS(${longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km,p.per_day_price,p.created_at,p.updated_at
                 FROM tbl_product p
                 JOIN tbl_user u ON u.id = p.owner_id WHERE p.owner_id = ? AND p.is_active = 1 AND p.is_delete = 0`,[user_id],(error,result1)=>{

                    if (!error && result1.length > 0) {
                        callback('1',{keyword : 'rest_keyword_item_list'},result1);
                    } else {
                        callback('2',{keyword : 'rest_keyword_data_null'},{});
                    }
                })

            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{});
            }
        })
    },

    product_edit : (request,user_id,callback) => {

            var productData = {
            title: request.title,
            category_id: request.category_id,
            description: request.description,
            per_day_price: request.per_day_price,
            per_week_price: request.per_week_price,
            per_month_price: request.per_month_price,
            bond_amount: request.bond_amount,
            condition_rating : request.condition_rating,
            location: request.location,
            latitude: request.latitude,
            longitude: request.longitude,
            condition_rating: request.condition_rating,
            availability_from: request.availability_from,
            availability_to: request.availability_to
       }

       con.query(`UPDATE tbl_product SET ? WHERE id = ?`,[productData,request.product_id],(error,result)=>{
           if (!error) {
               Auth.removeproductimages(request,(isRemoved)=>{

                if (isRemoved) {
                    if (request.image != undefined && request.image != "" && request.image.length > 0) {
    
                        asyncLoop(request.image,(item,next)=>{
                            var image = {
                                product_id : request.product_id,
                                media_type : request.media_type,
                                media : item
                            }
        
                            con.query("INSERT INTO tbl_product_image SET ?",[image],(error,result)=>{
                                if (!error) {
                                    next()
                                } else {
                                    next()
                                }
                            })

                        },()=>{

                            Auth.product_details(request.product_id,(productData)=>{
                            console.log(request.product_id);
                                if (productData == null) {
                                    callback('2',{keyword : 'rest_keyword_data_null'},{});
                                } else {
                                    callback('1',{keyword : 'rest_keyword_item_update'},productData)
                                }
                            })

                        })
                       
                    } else {
                        Auth.product(request.product_id,(productData)=>{
                            if (productData == null) {
                                callback('2',{keyword : 'rest_keyword_data_null'},{});
                            } else {
                                callback('1',{keyword : 'rest_keyword_item_update'},productData)
                            }
                        })
                    }
                } else {
                    callback('0',{keyword : 'rest_keyword_error_message'},{})
                }
            })
        }else{
            callback('0',{keyword : 'rest_keyword_error_message'},{}) 
        }
       })
    },

    nearproduct: (request, user_id, page, limit, callback) => {

        con.query(`SELECT * FROM tbl_user WHERE id =?`, [user_id], (error, response) => {
            if (!error && response.length > 0) {
                var latitude = response[0].latitude;
                var longitude = response[0].longitude;

                        con.query(`SELECT p.id,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,(SELECT i.media FROM tbl_product_image i WHERE p.id = i.product_id ORDER BY i.id DESC LIMIT 1) as image,p.title,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.is_active,p.is_delete,p.created_at,p.updated_at,
                        concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(latitude) - ABS(${latitude})) * PI()/180 / 2), 2) + COS(ABS(latitude) * PI()/180) * COS(ABS(${latitude}) * PI()/180) * POWER(SIN((ABS(longitude) - ABS(${longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km
                        FROM tbl_product p
                        HAVING distance_km <5
                        ORDER BY distance_km ASC LIMIT ?, ?`, [parseInt(page), parseInt(limit)], (error, result) => {

                    if (!error && result.length > 0) {
                        callback('1', { keyword: "rest_keyword_item_nearby" }, result)
                    } else {
                        callback('0', { keyword: "rest_keyword_error_message" }, {})
                    }
                })
            } else {
                callback('0', { keyword: "rest_keyword_error_message" }, {})
            }
        })

    },

    latestproduct: (request, user_id, page, limit, callback) => {

        con.query(`SELECT * FROM tbl_user WHERE id =?`, [user_id], (error, response) => {
            if (!error && response.length > 0) {
                var latitude = response[0].latitude;
                var longitude = response[0].longitude;

                con.query(`SELECT p.id,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,(SELECT i.media FROM tbl_product_image i WHERE p.id = i.product_id ORDER BY i.id DESC LIMIT 1) as image,p.title,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.is_active,p.is_delete,p.created_at,p.updated_at,
             concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(latitude) - ABS(${latitude})) * PI()/180 / 2), 2) + COS(ABS(latitude) * PI()/180) * COS(ABS(${latitude}) * PI()/180) * POWER(SIN((ABS(longitude) - ABS(${longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km
             FROM tbl_product p
             HAVING distance_km <5
             ORDER BY p.created_at DESC LIMIT ?, ?`, [parseInt(page), parseInt(limit)], (error, result) => {

                    if (!error && result.length > 0) {
                        callback('1', { keyword: "rest_keyword_item_nearby" }, result)
                    } else {
                        callback('0', { keyword: "rest_keyword_error_message" }, result)
                    }
                })
            } else {
                callback('0', { keyword: "rest_keyword_error_message" }, result)
            }
        })

    },

    allcategory : (request,user_id,callback) => {
      con.query(`SELECT * FROM tbl_categories WHERE is_active = 1 AND is_delete = 0;`,(error,result)=>{
        if (!error && result.length > 0) {
            callback('1',{keyword : "rest_keyword_data_all_category"},result);
        } else {
            callback('0',{keyword : "rest_keyword_error_message"},{})
        }
      })
    },

    product : (request,user_id,callback) => {
      con.query(`SELECT p.id,u.profile,concat(u.first_name,' ',u.last_name) as name,p.title,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category ,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to
      FROM tbl_product p 
      JOIN tbl_user u ON u.id = p.owner_id
      WHERE p.id = ?`,[request.product_id],(error,result)=>{

        if (!error && result.length > 0) {
            con.query(`SELECT * FROM tbl_product_image pi WHERE pi.product_id = ?`,[result[0].id],(error,response)=>{
                if (!error && response.length > 0) {
                    result[0].images = response
                    con.query(`SELECT * FROM tbl_product_condition_rating WHERE product_id = ?`,[request.product_id],(error,result1)=>{
                        if (!error && result1.length  > 0) {
                            result[0].reviews = result1
                            callback('1',{keyword : "rest_keyword_item_reviews"},result)
                        } else {
                            result[0].reviews = []
                            callback('0',{keyword : "rest_keyword_data_null"},result)
                        }
                    })
                } else {
                    result[0].images = []
                    callback('0',{keyword : "rest_keyword_item_details"},result);
                }
            })
        } else {
            callback('0',{keyword : "rest_keyword_error_message"},{});
        }
      })
    },

    product_order : (request,user_id,callback) => {
 
        var p_date = Math.floor(new Date(request.pickup_date).getTime());
        var r_date = Math.floor(new Date(request.return_date).getTime());
        var transaction_id = randomtoken.generate(16,'0123456789');

         var datediff = ((r_date - p_date)/(1000*3600*24) - 1);

        Auth.addproduct_details(request.product_id,(data)=>{

            var from_date = Math.floor(new Date(data.availability_from).getTime());
            var to_date = Math.floor(new Date(data.availability_to).getTime());

            var weeks = Math.floor((datediff / 7));
            var remainingDays = Math.floor((datediff % 7));

            var months = Math.floor((datediff / 30));
            var remainingMonthDays = Math.floor((datediff % 30));

            var total_price = 0;

            

            if (from_date > p_date || to_date < r_date) {
               callback('0',{keyword : "rest_keyword_item_not_available_date"},{})
            } else {
                if (datediff < 7) {
                    total_price = (datediff * data.per_day_price);
                } else if (datediff >= 7 && datediff < 30) {
                    total_price = ((weeks * data.per_week_price) + (remainingDays * data.per_day_price))
                } else {
                    if (remainingMonthDays < 30 && remainingMonthDays >= 7) {
                        var remainsWeek = Math.floor((remainingMonthDays / 7));
                        var days = Math.floor((remainingMonthDays % 7));
                        total_price = ((months * data.per_month_price) + (remainsWeek * data.per_week_price) + (days * data.per_day_price))
                    } else {
                        total_price = ((months * data.per_month_price) + (remainingMonthDays * data.per_day_price))
                    }
                } 

                if (data.product_status != "not available") { 
                    var orderData = {
                        user_id : user_id,
                        product_id : request.product_id,
                        pickup_date : request.pickup_date,
                        return_date : request.return_date,
                        payment_type : request.payment_type,
                        card_id : (request.card_id != undefined) ? request.card_id : "0",
                        account_id : (request.account_id != undefined) ? request.account_id : "0",
                        transaction_id : transaction_id,
                        total_amount : total_price
                     }
                     con.query(`INSERT INTO tbl_order SET ?`,[orderData],(error,result)=>{    
                        if (!error) {
                           Auth.order_details(result.insertId,(odata)=>{
                            callback('1',{keyword : "rest_keyword_order_confirm"},odata)
                           })
                        } else {
                            callback('0',{keyword : "rest_keyword_order_failed"},{})
                        }
                     })   
                } else {
                   callback('0',{keyword : 'rest_keyword_error_message'},{}) 
                }
               
            }
        })
    },

    request_received : (owner_id,callback) => {
      con.query(`SELECT o.id,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,o.total_amount,o.created_at,o.updated_at FROM tbl_order o 
      JOIN tbl_product p ON p.id = o.product_id
      JOIN tbl_user u ON u.id = p.owner_id
      WHERE p.owner_id = ? AND o.status = "pending" AND (o.is_active = 1 AND o.is_delete = 0);`,[owner_id],(error,result)=>{
        if (!error && result.length > 0) {
            callback('1',{keyword : "rest_keyword_request_recieve"},result);
        } else {
            callback('0',{keyword : "rest_keyword_error_message"},{});
        }
      })
    },

    request_sent : (request,req,user_id,callback) => {

        var status;
        if (req.query.status == "pending" && req.query.status != undefined) {
            status = `AND o.status = "${req.query.status}"`
        } else if(req.query.status == "accepted" && req.query.status != undefined){
            status = `AND o.status = "${req.query.status}"`
        } else if(req.query.status == "live" && req.query.status != undefined){
            status = `AND (o.pickup_date < curdate() AND o.return_date > curdate() )`
        } else {
            status = ``
        }
       
        con.query(`SELECT o.id,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,o.total_amount,o.created_at,o.updated_at FROM tbl_order o 
        JOIN tbl_product p ON p.id = o.product_id
        JOIN tbl_user u ON u.id = p.owner_id
        WHERE o.user_id = ? ${status} AND (o.is_active = 1 AND o.is_delete = 0);`,[user_id],(error,result)=>{
          if (!error && result.length > 0) {
              callback('1',{keyword : "rest_keyword_request_sent"},result);
          } else {
              callback('0',{keyword : "rest_keyword_error_message"},{});
          }
        })
    },

    request_details : (request,user_id,callback) => {

    con.query(`SELECT o.id,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,p.per_month_price,p.bond_amount,o.total_amount,p.condition_rating,p.location,p.latitude,p.longitude,o.created_at,o.updated_at FROM tbl_order o 
    JOIN tbl_product p ON p.id = o.product_id
    JOIN tbl_user u ON u.id = p.owner_id
    WHERE p.owner_id = ? AND o.id = ? AND o.status = "pending" AND (o.is_active = 1 AND o.is_delete = 0);`,[user_id,request.order_id],(error,result)=>{

        if (!error && result.length > 0) {
            callback('1',{keyword : "rest_keyword_request_details"},result);
        } else {
            callback('0',{keyword : "rest_keyword_error_message"},{});
        }
    })
    },

    request_status : (request,user_id,callback) => {

        Auth.order_details(request.order_id,(orderData)=>{
            if (orderData == null) {
               callback('2',{keyword: 'rest_keyword_data_null'},{})
            } else {
                if (orderData.status != "rejected") {
                    if (request.status == 1) {
                        var updData = {
                            status : "accepted"
                        }
                        con.query(`UPDATE tbl_order SET ? WHERE id = ? AND is_active = '1' AND is_delete = '0'`,[updData,request.order_id],(error,result)=>{
                            if (!error) {
                                Auth.order_details(request.order_id,(data)=>{
                                    if (data == null) {
                                        callback('2',{keyword : 'rest_keyword_data_null'},{});
                                    } else {
                                       callback('1',{keyword : 'rest_keyword_request_accepted'},data); 
                                    }
                                })
                            } else {
                              callback('0',{keyword : 'rest_keyword_error_message'},{});  
                            }
                        })
                    } else {
                        var updData = {
                            status : "rejected",
                            payment_status : "refund",
                            reject_reason : request.reason,
                            is_active : "0",
                            is_delete : "1"
                        }
            
                        con.query(`UPDATE tbl_order SET ? WHERE id = ?`,[updData,request.order_id],(error,result)=>{
                            if (!error) {
                                Auth.order_details(request.order_id,(data)=>{
                                    if (data == null) {
                                        callback('2',{keyword : 'rest_keyword_data_null'},{});
                                    } else {
                                       callback('1',{keyword : 'rest_keyword_request_rejected'},data); 
                                    }
                                })
                            } else {
                              callback('0',{keyword : 'rest_keyword_error_message'},{});  
                            }
                        })
                    }
                } else {
                   callback('1',{keyword : 'rest_keyword_request_already_rejected'},{}) 
                }
            }
        })
      
      

    },

    leased_status : (request,user_id,callback) => {
     
        Auth.order_details(request.order_id,(orderData)=>{
            if (orderData == null) {
                callback('1',{keyword : "rest_keyword_data_null"},{});
            } else {
              if (orderData.status != "accepted") {
                callback('0',{keyword : "rest_keyword_error_message"},{});
              } else {
                if (request.status == 1) {

                    con.query(`UPDATE tbl_order SET status = "return_confirm" WHERE id = ?`,[request.order_id],(error,result)=>{
                        if (!error) {
                            con.query(`UPDATE tbl_product SET product_status = "available" WHERE id = ?`,[orderData.product_id],(error,result)=>{
                                console.log(result);
                                if (!error) {
        
                                    var reviewData = {
                                        user_id : request.user_id,
                                        owner_id : user_id,
                                        rating : request.rating,
                                        review : request.review
                                    } 
        
                                    con.query(`INSERT INTO tbl_owner_rating SET ?`,[reviewData],(error,result)=>{
                                        if (!error) {
                                            con.query(`SELECT wr.* FROM tbl_owner_rating wr WHERE wr.id = ?`,[result.insertId],(error,response)=>{
                                                if (!error && response.length > 0) {
                                                callback('1',{keyword : 'review_submited'},response);  
                                                } else {
                                                  callback('2',{keyword : 'rest_keyword_data_null'},{})
                                                }
                                            }) 
                    
                                        } else {
                                            callback('0',{keyword : 'rest_keyword_error_message'},{}); 
                                        }
                                    })
        
                                } else {
                                   callback('1',{keyword : "rest_keyword_product_status"},{}); 
                                }
                            })
                        } else {
                            callback('0',{keyword : "rest_keyword_order_status_not_change"},{});
                        }
                    })

                   

                } else {

                 var updData = {
                  status : "raise_dispute"
                 }

                 con.query(`UPDATE tbl_order SET ? WHERE id = ?`,[updData,request.order_id],(error,result)=>{
                    if (!error) {
                      var disputeData = {
                        order_id : request.order_id,
                        message : request.reason
                      }
                        con.query(`INSERT INTO tbl_dispute SET ?`,[disputeData],(error,result)=>{
                            if (!error) {          
                                Auth.order_details(request.order_id,(data)=>{
                                    if (data == null) {
                                        callback('2',{keyword : 'data not found'},{});
                                    } else {
                                    con.query(`UPDATE tbl_product SET product_status = 'not available' WHERE id = ?;`,[data.product_id],(error,result)=>{
                                        console.log(error);
                                        if (!error) {
                                            callback('1',{keyword : 'requiest rejected'},data);    
                                        } else {
                                            callback('0',{keyword : 'product status not update'},{});   
                                        }
                                    })
                                    }
                                })
                            } else {
                                callback('0',{keyword : 'somwthing went wrong'},{});   
                            }
                        })
                    } else {
                      callback('0',{keyword : 'somwthing went wrong'},{});  
                    }
    
                })

                }
              }  
            }
        })
      
        // if (request.status == 1) {
        //  Auth.order_details(request.order_id,(orderData)=>{
        //     if (orderData == null) {
        //         callback('2',{keyword : 'data not found'},{})
        //     } else {
        //         if (orderData.status == "return_confirm") {
        //             callback('0',{keyword : 'already in raise dispute '},{})
        //         } else {
        //             var reviewData = {
        //                 user_id : user_id,
        //                 owner_id : request.owner_id,
        //                 rating : request.rating,
        //                 review : request.review
        
        //             }

        //             con.query(`UPDATE tbl_product SET status = "available" WHERE product_id = ?`,[orderData.product_id],(error,result)=>{
    
        //                 if (!error) {
                           
                           
        //                 } else {
        //                     callback('0',{keyword : 'somwthing went wrong'},{}); 
        //                 }
        //             })  
        //         }
        //     }
        //  })  
            
        // } else {
        //     var updData = {
        //         status : "raise_dispute"
        //     }

           
        // }

    },

    leased_out_details : (request,user_id,callback) => {

        con.query(`SELECT o.id,
        (SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = p.id ORDER BY pi.created_at DESC LIMIT 1) as image,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,p.per_month_price,p.bond_amount,o.total_amount,p.condition_rating,p.location,p.latitude,p.longitude,o.created_at,o.updated_at FROM tbl_order o 
                JOIN tbl_product p ON p.id = o.product_id
                JOIN tbl_user u ON u.id = p.owner_id
                WHERE p.owner_id = ? AND o.id = ? AND CURRENT_TIMESTAMP BETWEEN o.pickup_date AND o.return_date AND (o.is_active = 1 AND o.is_delete = 0);`,[user_id,request.order_id],(error,result)=>{
    
            if (!error && result.length > 0) {
                callback('1',{keyword : "rest_keyword_product_leased_out"},result);
            } else {
                callback('0',{keyword : "rest_keyword_error_message"},{});
            }
        })
    },

    add_card : (request,user_id,callback) =>{

        var trimCardNumber = request.card_number

        var cardObj = {
            user_id : user_id,
            card_type : request.card_type,
            card_number : trimCardNumber.slice(-4),
            cvv : request.cvv,
            expiry_date : request.expiry_date
        }

       con.query(`INSERT INTO tbl_card SET ?`,[cardObj],(error,result)=>{
        if (!error) {
            callback('1',{keyword : 'rest_keyword_card_insert'},{card_id : result.insertId})
        } else {
            callback('0',{keyword : 'rest_keyword_error_message'},{})
        }
       })
    },

    add_bankAcc : (request,user_id,callback) =>{

        var trimCardNumber = request.account_number

        var cardObj = {
            user_id : user_id,
            account_name : request.account_name,
            BSB : request.bsb,
            account_number : trimCardNumber.slice(-4),
        }

       con.query(`INSERT INTO tbl_bank_account SET ?`,[cardObj],(error,result)=>{
        console.log("error",error);
        if (!error) {
            callback('1',{keyword : 'rest_keyword_account_insert'},{account_id : result.insertId})
        } else {
            callback('0',{keyword : 'rest_keyword_error_message'},{})
        }
       })
    },

    user_review : (request,user_id,callback) =>{

        con.query(`SELECT wr.id,wr.user_id,wr.owner_id,u.profile,concat(u.first_name,' ',u.last_name) as name,wr.rating,wr.review,wr.is_active,wr.is_delete,wr.created_at,wr.updated_at FROM tbl_owner_rating wr 
        JOIN tbl_user u ON u.id = wr.user_id
        WHERE wr.owner_id = ?;`,[user_id],(error,result)=>{
            if (!error && result.length > 0) {
                callback('1',{keyword : 'rest_keyword_user_setting'},result);
            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{}); 
            }
        })
     
    },

    add_favourites: (request, user_id, callback) => {
        Auth.favourite(request, user_id, (data) => {
            if (data != true) {
                con.query(`DELETE FROM tbl_favourite WHERE user_id = ? AND product_id = ?`, [user_id, request.product_id], (error, result) => {
                    if (!error) {
                        callback('1', { keyword: 'rest_keyword_unfavourite'}, data)
                    }
                })
            } else {
                var dataObj = {
                    user_id: user_id,
                    product_id: request.product_id
                }
                con.query(`INSERT INTO tbl_favourite SET ?`, [dataObj], (error, response) => {
                    if (!error) {
                        callback('1', { keyword: 'rest_keyword_favourite' }, response)
                    } else {
                        callback('0', { keyword: 'rest_keyword_data_not_found' }, {})
                    }
                })
            }
        })

    },

    favourite_list : (request,user_id,callback) => {

        con.query(`SELECT * FROM tbl_user WHERE id = ?`,[user_id],(error,result)=>{
            if (!error && result.length > 0) {
                var latitude = result[0].latitude;
                var longitude = result[0].longitude;

                con.query(`SELECT f.id,(SELECT pi.media FROM tbl_product_image pi WHERE p.id = pi.product_id ORDER BY pi.created_at DESC LIMIT 1) as image,p.title,concat(u.first_name,' ',u.last_name) as name,(SELECT IFNULL(ROUND(AVG(pr.rating),1),0) FROM tbl_product_condition_rating pr WHERE p.id = pr.product_id) as product_rating, 
                concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(p.latitude) - ABS(${latitude})) * PI()/180 / 2), 2) + COS(ABS(p.latitude) * PI()/180) * COS(ABS(${latitude}) * PI()/180) * POWER(SIN((ABS(p.longitude) - ABS(${longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km,p.per_day_price,f.created_at
                FROM tbl_favourite f
                JOIN tbl_product p ON p.id = f.product_id
                JOIN tbl_user u ON u.id = p.owner_id
                WHERE f.user_id = ?;`,[user_id],(error,result)=>{
                    if (!error && result.length > 0) {
                        callback('1',{keyword : 'rest_keyword_favourite_list'},result);
                    } else {
                        callback('2',{keyword : 'rest_keyword_data_null'},{});
                    }
                })

            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{});
            }
        })

    },

    favourite: (request, user_id, callback) => {
        con.query(`SELECT * FROM tbl_favourite WHERE user_id = ? AND product_id = ?`, [user_id, request.product_id], (error, result) => {
            if (!error && result.length > 0) {
                callback(result[0]);
            } else {
                callback(true)

            }
        })

    },

    chat : (request,user_id,callback) => {

        var chatData = {
            sender_id : request.sender_id,
            receiver_id : request.receiver_id,
            product_id : request.product_id,
            message : request.message
        }
 
        con.query(`INSERT INTO tbl_chat SET ?`,[chatData],(error,result) => {
            if (!error) {
                con.query(`SELECT c.*,(SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = c.product_id ORDER BY pi.created_at DESC LIMIT 1 ) as image,p.title,p.description
                FROM tbl_chat c
                JOIN tbl_product p ON c.product_id = p.id
                WHERE c.id = ?`,[result.insertId],(error,result1)=>{
                    if (!error && result1.length > 0) {
                        callback('1',{keyword : 'rest_keyword_chat_box'},result1)
                    } else {
                        callback('2',{keyword : 'rest_keyword_chat_null'},{})
                    }
                })
            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{})
            }
        })
 
    },

    chat_display : (request,user_id,callback) => {

        con.query(`SELECT * FROM tbl_chat WHERE (sender_id = ${request.sender_id} AND receiver_id = ${request.receiver_id}) OR (sender_id = ${request.receiver_id} AND receiver_id = ${request.sender_id});`,(error,result) => {
            if (!error && result.length > 0) {
                callback('1' , {keyword : "rest_keyword_chat_display"},result);
            } else {
                callback('0' , {keyword : "rest_keyword_error_message"},{});
                
            }
        })
    },

    inbox : (request,sender_id,callback) => {

        con.query(`SELECT c.*,(SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = c.product_id ORDER BY pi.created_at DESC LIMIT 1 ) as image FROM tbl_chat c WHERE c.sender_id = ? GROUP BY receiver_id;`,[sender_id],(error,result)=>{
            if (!error && result.length > 0) {
                callback('1',{keyword : 'rest_keyword_inbox'},result);
            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{});
            }
        })
    },
    
    faq : (request,callback) => {

       con.query(`SELECT * FROM tbl_faq WHERE is_active = 1 AND is_delete = 0`,(error,result) =>{
        if (!error && result.length > 0) {
            callback('1',{keyword : 'rest_keyword_faq'},result);
        } else {
            callback('1',{keyword : 'rest_keyword_error_message'},{});
        }
       })
    },

    about_us : (request,callback) => {

        con.query(`SELECT * FROM tbl_app_content WHERE type = "about_us"`,(error,result) =>{
         if (!error && result.length > 0) {
             callback('1',{keyword : 'rest_keyword_about'},result);
         } else {
             callback('1',{keyword : 'rest_keyword_error_message'},{});
         }
        })
     },

     term_and_con : (request,callback) => {

        con.query(`SELECT * FROM tbl_app_content WHERE type = "term_condition"`,(error,result) =>{
         if (!error && result.length > 0) {
             callback('1',{keyword : 'rest_keyword_term'},result);
         } else {
             callback('1',{keyword : 'rest_keyword_error_message'},{});
         }
        })
     },

     privacy_policy : (request,callback) => {

        con.query(`SELECT * FROM tbl_app_content WHERE type = "privacy_page"`,(error,result) =>{
         if (!error && result.length > 0) {
             callback('1',{keyword : 'rest_keyword_privacy'},result);
         } else {
             callback('1',{keyword : 'rest_keyword_error_message'},{});
         }
        })
     },

    contact_us : (request,user_id,callback) =>{

        var dataObj = {
            user_id : user_id,
            email : request.email,
            subject : request.subject,
            message : request.message,
        }

        con.query(`INSERT INTO tbl_contact_us SET ?`,[dataObj],(error,result)=>{
            if (!error) {
            emailtemplate.support(request,(supporttemp)=>{
                common.sendmail(request.email,'Support',supporttemp,(issent)=>{
                    if (issent) {
                        callback('1',{keyword:'rest_keyword_query_submit',content:{}},request)
                    } else {
                        callback('0',{keyword:'rest_keyword_email_notfound',content:{}},{})
                    }
                })
            })
            } else {
                callback('0',{keyword:'rest_keyword_query_not_submit',content:{}},{})
            }
        })

    },

    add_review : (request,user_id,callback) => {
        var rating =  ((parseFloat(request.listing_accuracy) + parseFloat(request.communication) + parseFloat(request.satisfaction))/3)
         console.log(rating);
        var reviewData = {
            product_id : request.product_id,
            user_id : user_id,
            rating : rating,
            listing_accuracy : request.listing_accuracy,
            communication : request.communication,
            satisfaction : request.satisfaction,
            review : (request.review != undefined) ? request.review : ""
        }
        
        con.query(`INSERT INTO tbl_product_condition_rating SET ?`,[reviewData],(error,result)=>{
            console.log(error);
            if (!error) {
                con.query(`SELECT * FROM tbl_product_condition_rating WHERE id = ?`,[result.insertId],(error,result1)=>{
                    if (!error && result1.length > 0) {
                        callback('1',{keyword : 'rest_keyword_data_feedback'},result1);
                    } else {
                        callback('2',{keyword : 'rest_keyword_data_null'},{});
                    }
                })
                
            } else {
                callback('0',{keyword : 'rest_keyword_error_message'},{});   
            }
        })
    },

    transaction_history : (request,user_id,callback) => {

        var filter;
        if (request.filter == "borrow") {
            filter = `o.user_id = ${user_id} AND o.status = "return_confirm"`
        } else {
            filter = `p.owner_id = ${user_id}`
        }

       con.query(`SELECT o.id,o.product_id,o.user_id,(SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = p.id ORDER BY pi.created_at DESC LIMIT 1) as image,p.title,DATE_FORMAT(o.pickup_date,"%d %M, %Y") as date,o.total_amount,o.request_msg,o.created_at,o.updated_at
       FROM tbl_order o 
       JOIN tbl_product p ON o.product_id = p.id
       WHERE ${filter}`,(error,result)=>{
         if (!error && result.length > 0) {
            callback('1',{keyword : 'rest_keyword_item_details'},result);
         } else {
            callback('0',{keyword : 'rest_keyword_error_message'},{});
         }
       })
    },

    alert : (user_id,callback) => {
       con.query(`SELECT * FROM tbl_notification WHERE user_id = ? ORDER BY created_at DESC`,[user_id],(error,result)=>{
        console.log(result);
        if (!error && result.length > 0) {
            callback('1',{keyword : 'rest_keyword_alert'},result);
        } else {
            callback('0',{keyword : 'rest_keyword_error_message'},{});
        }
       })
    },

    dashboard : (request,user_id,callback) => {

      con.query(`SELECT * FROM tbl_product WHERE owner_id = ?`,[user_id],(error,result)=>{
        if (!error && result.length > 0) {
            Auth.alert(user_id,(code,msg,alertData)=>{
                if (!alertData) {
                    alertData.length = 0;
                }

            Auth.total_earning(user_id,(earning)=>{
                if (!earning) {
                    earning.length = 0;
                }
           
             
           
            Auth.item_listed(result[0].id,(itemData)=>{
                if (!itemData) {
                    itemData.length = 0;
                }

                Auth.curr_leased_out(user_id,(leasedData)=>{
                    if (!leasedData) {
                        leasedData.length = 0;
                    }
                
            
            
            Auth.request_received(user_id,(a,b,receivedData)=>{
                if (!receivedData) {
                    receivedData.length = 0;
                }
            

            Auth.sent(user_id,(sentData)=>{
                if (!sentData) {
                    sentData.length = 0;
                }

            user.getuserdetails(user_id,(userData)=>{

            callback('1',{keyword : 'rest_keyword_dashboard'},{
                earned : earning.total,
                alert : alertData.length,
                item_listed : itemData.length,
                leased_out_list : leasedData.length,
                request_recieved : receivedData.length,
                request_sent : sentData.length,
                member_since : userData.login_time
            })
            })
        })
    })
    })
    })  
        })  
    })
        } else {
            callback('0',{keyword : 'rest_keyword_error_message'},{})
        }
      })
         
    },

    search: (request, req, user_id, callback) => {

        con.query(`SELECT * FROM tbl_user WHERE id =?`, [user_id], (error, response) => {
            if (!error && response.length > 0) {
                var latitude = response[0].latitude;
                var longitude = response[0].longitude;

                //distance_filter

                var distance;
                if (req.query.distance != undefined && req.query.distance != "") {
                    distance = `distance_km <= ${req.query.distance}`
                } else {
                    distance = "distance_km <= 10"
                }



                //per_day_filter
                var priceby;
                var pricebetween;

                if (req.query.priceby == "per_day" && req.query.priceby != undefined && req.query.priceby != "") {

                    if (req.query.price == "high_to_low" && req.query.price != undefined && req.query.price != "" && req.query.from == undefined) {
                        priceby = `ORDER BY p.per_day_price DESC`
                    } else if (req.query.price == "low_to_high" && req.query.price != undefined && req.query.price != "") {
                        priceby = `ORDER BY p.per_day_price ASC`
                    } else {
                        priceby = ``
                    }

                    if (req.query.price_from != undefined && req.query.price_from != "" && req.query.price_to != undefined && req.query.price_to != "") {
                        pricebetween = `AND p.per_day_price BETWEEN ${req.query.price_from} AND ${req.query.price_to}`
                    } else {
                        pricebetween = ``
                    }

                } else if (req.query.priceby == "per_week" && req.query.priceby != undefined && req.query.priceby != "") {

                    if (req.query.price == "high_to_low" && req.query.price != undefined && req.query.price != "") {
                        priceby = `ORDER BY p.per_week_price DESC`
                    } else if (req.query.price == "low_to_high" && req.query.price != undefined && req.query.price != "") {
                        priceby = `ORDER BY p.per_week_price ASC`
                    } else {
                        priceby = ``
                    }

                    if (req.query.price_from != undefined && req.query.price_from != "" && req.query.price_to != undefined && req.query.price_to != "") {
                        pricebetween = `AND p.per_week_price BETWEEN ${req.query.price_from} AND ${req.query.price_to}`
                    } else {
                        pricebetween = ``
                    }

                } else if (req.query.priceby == "per_month" && req.query.priceby != undefined && req.query.priceby != "") {

                    if (req.query.price == "high_to_low" && req.query.price != undefined && req.query.price != "") {
                        priceby = `ORDER BY p.per_month_price DESC`
                    } else if (req.query.price == "low_to_high" && req.query.price != undefined && req.query.price != "") {
                        priceby = `ORDER BY p.per_month_price ASC`
                    } else {
                        priceby = ''
                    }

                    if (req.query.price_from != undefined && req.query.price_from != "" && req.query.price_to != undefined && req.query.price_to != "") {
                        pricebetween = `AND p.per_month_price BETWEEN ${req.query.price_from} AND ${req.query.price_to}`
                    } else {
                        pricebetween = ``
                    }

                } else {
                    priceby = ''
                }

                //category_wise

                var category_wise;
                if (req.query.category != undefined && req.query.category != "") {
                    category_wise = `AND category = '${req.query.category}'`
                } else {
                    category_wise = ""
                }

                //date_filter

                var datewise;

                if (req.query.date_from != undefined && req.query.date_to != "") {
                    datewise = `AND (p.availability_from >= '${req.query.date_from}' AND  p.availability_to <= '${req.query.date_to}')`
                } else {
                    datewise = ""
                }

                //location_wise

                var location;
                if (req.query.location != undefined && req.query.location != "") {
                   location = `AND p.location LIKE "%${req.query.location}%"`
                } else {
                    location = '' 
                }

                //owner_rating_wise

                var own_rating;
                if (req.query.owner_rating != undefined && req.query.owner_rating != "") {
                    own_rating = `AND p.owner_rating >= ${req.query.owner_rating}`
                } else {
                    own_rating = ``
                }

                //condition_rating

                var con_rating;
                if (req.query.condition_rating != undefined && req.query.condition_rating != "") {
                    con_rating = `AND p.condition_rating >= ${req.query.condition_rating}`
                } else {
                    con_rating = ``
                }


                //simple_search
                var search;
                if (request.search != undefined && request.search != "") {
                    search = request.search
                } else {
                    search = ""
                }

                //distance_query
                var distance_query = `concat(round(6371 * 2 * ASIN(SQRT(POWER(SIN((ABS(latitude) - ABS(${latitude})) * PI()/180 / 2), 2) + COS(ABS(latitude) * PI()/180) * COS(ABS(${latitude}) * PI()/180) * POWER(SIN((ABS(longitude) - ABS(${longitude})) * PI()/180 / 2), 2))), 2),' km') AS distance_km`



                con.query(`SELECT p.id,(SELECT i.media FROM tbl_product_image i WHERE p.id = i.product_id ORDER BY i.id DESC LIMIT 1) as media,p.title,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,(SELECT concat(u.first_name," ",u.last_name) FROM tbl_user u WHERE u.id = p.owner_id) as owner_name,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,(SELECT ifnull(round(AVG(wr.rating),1),0) FROM tbl_owner_rating wr WHERE p.owner_id = wr.owner_id) as owner_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.created_at,p.updated_at,
                ${distance_query}
                FROM tbl_product p
                WHERE p.title LIKE "%${search}%" ${datewise} ${location} ${con_rating} ${pricebetween}
                HAVING ${distance} ${own_rating} ${category_wise} ${priceby}`, (error, result) => {
                    if (!error && result.length > 0) {
                        callback('1', { keyword: "rest_keyword_item_nearby" }, result)
                    } else {
                        callback('0', { keyword: "rest_keyword_error_message" }, result)
                    }
                })
            } else {
                callback('0', { keyword: "rest_keyword_error_message" }, result)
            }
        })

    },

    addproduct_details: (product_id, callback) => {

        con.query(`SELECT p.id,p.title,c.name as category,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.created_at,p.updated_at FROM tbl_product p
        JOIN tbl_categories c ON c.id = p.category_id WHERE p.id = ?`, [product_id], (error, result) => {
            if (!error && result.length > 0) {
                con.query(`SELECT i.id,i.product_id,i.media_type,i.media,i.is_active,i.is_delete,i.created_at FROM tbl_product_image i WHERE product_id = ?;`, [product_id], (error, response) => {
                    if (!error && result.length > 0) {
                        result[0].images = response
                        callback(result[0]);
                    } else {
                        result[0].images = []
                        callback(result[0]);
                    }
                })
            } else {
            }
        })
    },

    order_details: (order_id, callback) => {

        con.query(`SELECT o.id,o.product_id,o.user_id,p.owner_id,p.category_id,o.payment_type,o.card_id,o.account_id,o.status,o.payment_status,o.transaction_id,o.pickup_date,o.return_date,o.total_amount,p.title,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,o.created_at,o.updated_at
        FROM tbl_order o 
        JOIN tbl_product p ON p.id = o.product_id
        WHERE o.id = ?;`, [order_id], (error, result) => {
            con.query(`SELECT i.id,i.product_id,i.media_type,i.media,i.is_active,i.is_delete,i.created_at FROM tbl_product_image i WHERE product_id = ?;`, [order_id], (error, response) => {
                if (!error && result.length > 0) {
                    result[0].images = response
                    callback(result[0]);
                } else {
                    result[0].images = []
                    callback(result[0]);
                }
            })
        })
    },

    product_details: (product_id, callback) => {

        con.query(`SELECT p.id,p.owner_id,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,p.title,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.is_active,p.is_delete,p.created_at,p.updated_at FROM tbl_product p 
        WHERE p.id = ?`, [product_id], (error, result) => {
            con.query(`SELECT i.id,i.product_id,i.media_type,i.media,i.is_active,i.is_delete,i.created_at FROM tbl_product_image i WHERE product_id = ?;`, [product_id], (error, response) => {
                if (!error && result.length > 0) {
                    result[0].images = response
                    callback(result[0]);
                } else {
                    result[0].images = []
                    callback(result[0]);
                }
            })
        })
    },

    item_listed: (product_id, callback) => {

        con.query(`SELECT p.id,p.owner_id,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,p.title,p.description,p.product_status,p.per_day_price,p.per_week_price,p.per_month_price,p.bond_amount,p.condition_rating,p.availability_from,p.availability_to,p.location,p.latitude,p.longitude,p.is_active,p.is_delete,p.created_at,p.updated_at FROM tbl_product p 
        WHERE p.id = ?`, [product_id], (error, result) => {
           console.log(result);
            if (!error && result.length > 0) {
                callback(result)
            } else {
                callback([])
            }
          
        })
    },

    curr_leased_out: (owner_id, callback) => {

        con.query(`SELECT o.id,
        (SELECT pi.media FROM tbl_product_image pi WHERE pi.product_id = p.id ORDER BY pi.created_at DESC LIMIT 1) as image,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,p.per_month_price,p.bond_amount,o.total_amount,p.condition_rating,p.location,p.latitude,p.longitude,o.created_at,o.updated_at FROM tbl_order o 
                JOIN tbl_product p ON p.id = o.product_id
                JOIN tbl_user u ON u.id = p.owner_id
                WHERE p.owner_id = ? AND CURRENT_TIMESTAMP BETWEEN o.pickup_date AND o.return_date AND (o.is_active = 1 AND o.is_delete = 0);`, [owner_id], (error, result) => {
           
            if (!error && result.length > 0) {
                callback(result)
            } else {
                callback([])
            }
          
        })
    },

    total_earning: (owner_id, callback) => {

        con.query(`SELECT SUM(o.total_amount) as total FROM tbl_order o
        JOIN tbl_product p ON o.product_id = p.id
        WHERE p.owner_id  = ? AND status = "accepted" AND CURRENT_TIMESTAMP BETWEEN o.pickup_date AND o.return_date AND (o.is_active = 1 AND o.is_delete = 0)`, [owner_id], (error, result) => {
           
            if (!error && result.length > 0) {
                callback(result[0])
            } else {
                callback([])
            }
          
        })
    },

    sent: (owner_id, callback) => {

        con.query(`SELECT o.id,u.profile,concat(u.first_name,' ',u.last_name) as customer_name,(SELECT c.name FROM tbl_categories c WHERE c.id = p.category_id) as category,concat(DATE_FORMAT(o.pickup_date,'%d %M') ,' - ',DATE_FORMAT(o.return_date,'%d %M'),' ', DATEDIFF(o.return_date, o.pickup_date)) as days_required_for,o.total_amount,o.created_at,o.updated_at FROM tbl_order o 
        JOIN tbl_product p ON p.id = o.product_id
        JOIN tbl_user u ON u.id = p.owner_id
        WHERE o.user_id = ? AND o.status = "pending" AND (o.is_active = 1 AND o.is_delete = 0);`, [owner_id], (error, result) => {
           
            if (!error && result.length > 0) {
                callback(result)
            } else {
                callback([])
            }
          
        })
    },


    removeproductimages: (request, callback)=>{
        let remove_id = request.remove_image_id;
    if (request.remove_image_id != undefined && request.remove_image_id != "" && request.remove_image_id.length > 0) {
        asyncLoop(remove_id, (item,next) => {
          con.query(`DELETE FROM tbl_product_image WHERE id = ?`,[item.value],(error,result)=>{
            next()
          })
        },()=>{
        callback(true)
        })
    } else {
        callback(true);
    }
    }

}

module.exports = Auth;