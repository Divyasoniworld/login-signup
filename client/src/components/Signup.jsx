import {useState} from 'react'
import "../css/signup.css"
import { Link ,useNavigate} from 'react-router-dom'
import axios from 'axios';

function Signup() {

    const navigate = useNavigate();

    const [first_name,setFirst_name] = useState('');
    const [last_name,setLast_name] = useState('');
    const [mobile,setMobile] = useState('');
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');


    const handleSubmit = (e) =>{
       e.preventDefault()
       let data = JSON.stringify({
         first_name: first_name,
         last_name: last_name,
         mobile: mobile,
         email: email,
         password: password,
         device_type: 'A',
         device_token: 0
       });
       
       let config = {
         method: 'post',
         maxBodyLength: Infinity,
         url: 'http://localhost:9595/api/v1/auth/signup',
         headers: { 
           'api-key': 'XnOBHi0M9hkUAI2RWa7J6zZn5NsEm1ofrZy5uVybFTw=XnOBHi0M9hkUAI2RWa7J6zZn5NsEm1ofrZy5uVybFTw=', 
           'Content-Type': 'application/json'
         },
         data : data
       };
       
       axios.request(config)
       .then((response) => {
        navigate('/login');
         console.log(JSON.stringify(response.data));
       })
       .catch((error) => {
         console.log(error);
       });
       console.log(data);
    }


  return (
   <>

<div className="signup-form">
    <form  method="post">
		<h2>Sign Up</h2>
        <div className="form-group">
        	<input type="text" className="form-control" name="first_name" onChange={(e)=>{setFirst_name(e.target.value)}} placeholder="First Name" required="required" />
        </div>
        <div className="form-group">
        	<input type="text" className="form-control" name="last_name" onChange={(e)=>{setLast_name(e.target.value)}} placeholder="Last Name" required="required" />
        </div>
        <div className="form-group">
        	<input type="tel" className="form-control" name="mobile" onChange={(e)=>{setMobile(e.target.value)}} placeholder="Mobile" required="required" />
        </div>
        <div className="form-group">
        	<input type="email" className="form-control" name="email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email " required="required" />
        </div>
		<div className="form-group">
            <input type="password" className="form-control" name="password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" required="required" />
        </div>      
        <div className="form-group">
			<label className="form-check-label"><input type="checkbox" required="required" /> I accept the <a href="/login">Terms of Use</a> &amp; <a href="#">Privacy Policy</a></label>
		</div>
		<div className="form-group">
            <button type="submit" onClick={handleSubmit}  className="btn btn-primary btn-lg">Sign Up</button>
        </div>
    </form>
	<div className="text-center">Already have an account? <Link to="/login">Login here</Link></div>
</div>

   </>
  )
}

export default Signup