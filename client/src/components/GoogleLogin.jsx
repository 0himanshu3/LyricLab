import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';  
import { signInSuccess } from '../redux/user/userSlice';
import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';

const GoogleLogin = (props) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();  

  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult.code);
        dispatch(signInSuccess(result.data));  
        navigate('/search?tab=profile');
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (e) {
      console.log('Error while Google Login...', e);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="App">
    <Button type='button' gradientDuoTone='pinkToOrange' outline onClick={googleLogin}>
        <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
        Continue with Google
    </Button>
    </div>
  );
};

export default GoogleLogin;
