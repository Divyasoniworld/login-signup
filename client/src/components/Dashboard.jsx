import {useEffect,useState} from 'react';
import { useNavigate } from 'react-router-dom'
import {BiUserCircle } from 'react-icons/bi'
import {AiOutlineHeart,AiFillHeart} from 'react-icons/ai'
const image = "https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80"

function Dashboard() {
  const  [like,setLike] = useState(false)
  const  [likeCount,setLikeCount] = useState(0)

  const navigate = useNavigate();
  const auth = localStorage.getItem('email')
  
  useEffect(() => {
    if (auth === null || auth === undefined) {          
      navigate('/login')
    } else {
      navigate('/dashboard')
    }
   
  }, []);

  const handleLike = () =>{
    if (!like) {
      setLike(true)
      setLikeCount(likeCount + 1)
    } else {
      setLike(false)
      setLikeCount(likeCount - 1)
    }
  }

  return (
    <>
      <div className="main_container">
        <h4>Like : {likeCount}</h4>
        <div className="card">
          <div className="card-header">
          <div className='d-flex'>
            <h4 className='mx-3'><BiUserCircle size={"30px"}/></h4>
            <h4>username</h4>
          </div>
          <div className="card-body">
          <img src={image} alt='profile' height={"365px"} onDoubleClick={handleLike}/>
          </div>
          <div className="card-footer d-flex justify-content-center">
          {like ? (<AiFillHeart size={"30px"} className='text-danger' onClick={handleLike}  style={{cursor:"pointer"}} />) : <AiOutlineHeart size={"30px"}  onClick={handleLike}  style={{cursor:"pointer"}}/>}
            </div>
          <p className='d-flex justify-content-center'>{likeCount ? (likeCount) : likeCount === ""} like</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
