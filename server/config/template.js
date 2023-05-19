exports.welcomeemail = (request,callback) =>{
    var template = 
`
<html>
<head>
<style>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  max-width: 300px;
  margin: auto;
  text-align: center;
  font-family: arial;
}

.price {
  color: grey;
  font-size: 22px;
}
.name {
    color: red
}

.card button {
  border: none;
  outline: 0;
  padding: 12px;
  color: white;
  background-color: #000;
  text-align: center;
  cursor: pointer;
  width: 100%;
  font-size: 18px;
}

.card button:hover {
  opacity: 0.7;
}
</style>
</head>
<body>

<h2 style="text-align:center">Welcome to NodeJs Training 2023</h2>

<div class="card">
  <img src=${request.image} alt="Denim Jeans" style="width:100%">
  <h1>${request.name}</h1>

  <p>Thank you for choosing our NodeJs training <span class = name>${request.name}</span></p><br>
  <p>Regards,</p>
  <p>NodeJs Training..</p>
</div>

</body>
</html>
`
callback(template)
};

exports.loginemail = (request,callback) =>{
    var template = 
`
<html>
<head>
</head>
<body>

<h2 style="text-align:center">Welcome to NodeJs Training </h2>

</body>
</html>
`
callback(template)
};

exports.forgotpass = (request,callback) =>{
  var template = 
`
<!DOCTYPE html>
<html>
<head>
<style>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  max-width: 300px;
  margin: auto;
  text-align: center;
  font-family: arial;
}

.price {
  color: grey;
  font-size: 22px;
}

  button {
  border: none;
  outline: 0;
  padding: 12px;
  color: white;
  background-color: blue;
  text-align: center;
  cursor: pointer;
  width: 100%;
  font-size: 18px;
}

a {
text-decoration: none;
color: white;
}

.card button:hover {
  opacity: 0.7;
}
</style>
</head>
<body>

<div class="card">
  <h1>Forgot Password</h1>
    <button><a href="http://localhost:9191/api/v1/auth/forgot/${request.id}">Reset Password</a></button>
</div>

</body>
</html>

`
callback(template)
};

exports.verification = (request,callback) =>{
  var template = 
`
<!DOCTYPE html>
<html>
<head>
<style>
.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  max-width: 300px;
  margin: auto;
  text-align: center;
  font-family: arial;
}

.price {
  color: grey;
  font-size: 22px;
}

  button {
  border: none;
  outline: 0;
  padding: 12px;
  color: white;
  background-color: blue;
  text-align: center;
  cursor: pointer;
  width: 100%;
  font-size: 18px;
}

a {
text-decoration: none;
color: white;
}

.card button:hover {
  opacity: 0.7;
}
</style>
</head>
<body>

<div class="card">
  <h1>Verification</h1>
    <button style="color:#fff">OTP : ${request}</button>
</div>

</body>
</html>

`
callback(template)
};

exports.support = (request,callback) =>{
  var template = 
`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>faq</title>
</head>
<body>
    <h1>Support</h1>
    <h4>Hello! ${request.email} Thank you for connecting your request passed in our team.your tiket number is <span style='color:red'>4587145</span></h4>
</body>
</html>

`
callback(template)
};