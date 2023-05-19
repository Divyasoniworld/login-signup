require('dotenv').config();
const express = require('express');
const Validator = require('Validator');
var app = express();
var cors = require('cors');
app.use(cors())
app.use(express.json());
var ejs = require('ejs').renderFile;
app.use(express.urlencoded({extended:false}));

app.use('/v1/api_document/',require('./modules/v1/api_document/index'))
const auth = require('./modules/v1/auth/route');
const item = require('./modules/v1/services/route');
app.use('/',require('./middleware/validator').validateApi);
app.use('/',require('./middleware/validator').validateHeaderToken);
app.use('/',require('./middleware/validator').extractHeaderLanguage);
app.use('/api/v1/auth', auth);
app.use('/api/v1', item);

app.engine('html',ejs)
app.set('view engine','html');
            

try {
    app.listen(process.env.PORT);
    console.log('server connected on PORT: ' + process.env.PORT);
} catch (error) {
    console.log('connection error :( ');
}