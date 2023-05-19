const Validator = require("Validator");
const con = require("../config/database");
const { default: localizify } = require("localizify");
const en = require("../language/en");
const ar = require("../language/ar");
var { t } = require("localizify");
const { response } = require("express");


var cryptLib = require("cryptlib");
var shakey = cryptLib.getHashSha256(process.env.KEY, 32);

var middleware = {
    checkValidation: (res, request, rules, massage) => {
        var v = Validator.make(request, rules, massage);

        if (v.fails()) {
            const errors = v.getErrors();

            var error = "";
            for (var key in errors) {
                error = errors[key][0];
                break;
            }

            var response_data = {
                code: "0",
                massage: error,
            };
           middleware.encryption(response_data, (response) => {
                res.status(200);
                res.send(response_data);
            });
            return false;
        } else {
            return true;
        }
    },

    sendResponse: (req, res, code, massage, data) => {
        middleware.getmassages(req.lang, massage, (translatedmassage) => {
            if (data == null) {
                response_data = {
                    code: code,
                    massage: translatedmassage,
                };
                middleware.encryption(response_data, (response) => {
                    res.status(200);
                    res.send(response_data);
                });
            } else {
                response_data = {
                    code: code,
                    massage: translatedmassage,
                    data: data
                };
                middleware.encryption(response_data, (response) => {
                    res.status(200);
                    res.send(response_data);
                });
            }
        });
    },

    validateApi: (req, res, callback) => {
        var api_key =
            req.headers["api-key"] != undefined && req.headers["api-key"] != ""
                ? req.headers["api-key"]
                : "";

        const path_data = req.path.split("/");
        var bypassApi = new Array("forgotpassword", "forgot", "forgoted", "upload");

        if (bypassApi.indexOf(path_data[4]) === -1) {
            if (api_key != "") {
                try {
                     var dec_apikey = cryptLib.decrypt(api_key, shakey, process.env.IV);
                     if (dec_apikey != "" && dec_apikey == process.env.API_KEY) {
                        callback();
                     } else {
                         response_data = {
                             code: "0",
                             massage: "Invalid Api key",
                         };
                        middleware.encryption(response_data, (response) => {
                             res.status(401);
                             res.send(response_data);
                        });
                     }
                } catch (error) {
                    response_data = {
                        code: "0",
                        massage: "Invalid Api key",
                    };
                    middleware.encryption(response_data, (response) => {
                        res.status(401);
                        res.send(response_data);
                    });
                }
            } else {
                response_data = {
                    code: "0",
                    massage: "Invalid Api key",
                };
                middleware.encryption(response_data, (response) => {
                    res.status(401);
                    res.send(response_data);
                });
            }
        } else {
            callback();
        }
    },

    validateHeaderToken: (req, res, callback) => {
        var headertoken =
            req.headers["token"] != undefined && req.headers["token"] != ""
                ? req.headers["token"]
                : "";

        const path_data = req.path.split("/");
        const bypassMethods = new Array(
            "validator",
            "signup",
            "login",
            "forgotpassword",
            "forgoted",
            "forgot",
            "addproduct",
            "upload"
        );

        if (
            bypassMethods.indexOf(path_data[4]) === -1 &&
            bypassMethods.indexOf(path_data[3]) === -1
        ) {
            if (headertoken != "") {
                try {
                    var dec_token = cryptLib.decrypt(headertoken, shakey, process.env.IV);

                    if (dec_token != '') {
    
                        con.query(`SELECT * FROM tbl_device_info WHERE token = ?`,
                            [dec_token],(error, result) => {
                                if (!error && result.length > 0) {
                                    req.user_id = result[0].user_id;
                                    callback();
                                } else {
                                    response_data = {
                                        code: "0",
                                        massage: "Invalid provided token",
                                    };
                                    middleware.encryption(response_data, (response) => {
                                        res.status(401);
                                        res.send(response_data);
                                   });
                                }
                            }
                        );
                        
                    } else {
                        response_data = {
                            code: "0",
                            massage: "Invalid provided token",
                        };
                        middleware.encryption(response_data, (response) => {
                            res.status(401);
                            res.send(response_data);
                        });
                    }
                } catch (error) {
                    response_data = {
                        code: "0",
                        massage: "Invalid provided token",
                    };
                   middleware.encryption(response_data, (response) => {
                        res.status(401);
                        res.send(response_data);
                    });
                }
            } else {
                response_data = {
                    code: "0",
                    massage: "Invalid provided token",
                };
                middleware.encryption(response_data, (response) => {
                    res.status(401);
                    res.send(response_data);
               });
            }
        } else {
            callback();
        }
    },

    extractHeaderLanguage: (req, res, callback) => {
        var headerlang =
            req.headers["accept-language"] != undefined &&
                req.headers["accept-language"] != ""
                ? req.headers["accept-language"]
                : "en";
        req.lang = headerlang;
        req.language = headerlang == "en" ? en : ar;
        localizify.add("en", en).add("ar", ar).setLocale(headerlang);

        callback();
    },

    getmassages: (language, massage, callback) => {
        localizify.add("en", en).add("ar", ar).setLocale(language);
        callback(t(massage.keyword));
    },

    decryption: (encrypted_text, callback) => {
        if (encrypted_text != "" && Object.keys(encrypted_text).length !== 0) {
            try {
                var request = JSON.parse(
                    cryptLib.decrypt(encrypted_text, shakey, process.env.IV)
                );
                callback(request);
            } catch (error) {
                callback({});
            }
        } else {
            callback({});
        }
    },

    encryption: (response_data, callback) => {
        var response = cryptLib.encrypt(
            JSON.stringify(response_data),
            shakey,
            process.env.IV
        );
        callback(response);
    },
};

module.exports = middleware;
