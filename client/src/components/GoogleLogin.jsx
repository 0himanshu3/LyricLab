import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';  
import { signInSuccess } from '../redux/user/userSlice';

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
      <button onClick={googleLogin}>
        Sign in with Google
      </button>  
    </div>
  );
};

export default GoogleLogin;
