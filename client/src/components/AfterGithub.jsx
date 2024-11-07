import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { signInSuccess } from '../redux/user/userSlice'; 

const AfterGithub = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/user/${userId}`);
          const userData = response.data;

          // Dispatch sign-in success action with fetched user data
          dispatch(signInSuccess(userData));

          navigate('/search?tab=profile');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [userId, dispatch, navigate]);

  return (
    <div>
      Loading user data...
    </div>
  );
};

export default AfterGithub;
