import {useState} from 'react'
import '../css/login.css'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
function Login() {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const [Error,setError] = useState("");
const navigate = useNavigate();
 

const handleLogin = (e) =>{
  e.preventDefault()
  let data = JSON.stringify({
    email: email,
    password: password,
    device_type: 'A',
    device_token: 0
  });
  
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:9595/api/v1/auth/login',
    headers: { 
      'api-key': 'XnOBHi0M9hkUAI2RWa7J6zZn5NsEm1ofrZy5uVybFTw=XnOBHi0M9hkUAI2RWa7J6zZn5NsEm1ofrZy5uVybFTw=', 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    setError(response.data.massage)
    if (response.data) {
      var token = (response.data.data.token);
     localStorage.setItem('email',token)
     navigate('/dashboard')
    }
  })
  .catch((error) => {
    console.log(error);
  });
}



  return (
    <>
<div className="signup-form">
    <form  method="post">
		<h2>Login</h2>
        <div className="form-group">
        	<input type="email" className="form-control" name="email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email Address" required="required" />
        </div>
		<div className="form-group">
            <input type="password" className="form-control" name="password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" required="required" />
        </div>
		<div className="form-group">
            <button type="submit" onClick={handleLogin} className="btn btn-primary btn-lg">Login</button>
        </div>
    </form>
    <h5 className='text-danger'>{Error}</h5>
	<div className="text-center">Don't have an account? <Link to="/">Create An Account</Link></div>
</div>

    </>
  )
}

export default Login