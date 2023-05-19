var con = require('../../../config/database');
var GLOBALS = require('../../../config/constant');

var API = {

    /**
     * Function to get api users list
     * 04-06-2021
     * @param {Function} callback 
     */
    apiuserList: function (callback) {

        con.query(`SELECT u.*,ifnull(di.token,'') as token,ifnull(di.device_type,'') as device_type,ifnull(di.device_token,'') as device_token FROM tbl_user u
        LEFT JOIN tbl_device_info di ON di.user_id = u.id
        WHERE u.is_active = 1`, function (err, result, fields) {
            if (!err) {
                callback(result);
            } else {
                callback(null, err);
            }
        });
    },
}

module.exports = API;