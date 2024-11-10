import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';
import { HiBell } from 'react-icons/hi';
import axios from 'axios';

export default function Header() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0); // State for unread notification count
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (currentUser) {
        try {
          const response = await axios.get(`/api/noti/unreadcount/${currentUser._id}`);
          setUnreadCount(response.data.count);
        } catch (error) {
          console.error('Error fetching unread notifications count:', error);
        }
      }
    };

    fetchUnreadCount();
  }, [currentUser]);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
      navigate('/');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Navbar className='border-b-2 bg-gray-200 text-gray-700 dark:bg-gray-950'>
      <Link to={currentUser ? '/search?tab=profile' : '/'} className='flex-shrink-0 ml-4'>
        <img 
          src={theme === 'light' ? './images/logo2.jpg' : './images/logo2dark.png'} 
          alt='Lyric Lab Logo'
          className='h-5 md:h-6 lg:h-8'  
        />
      </Link>

      <div className='flex items-center gap-4 md:order-2'>
        
        {currentUser && (
          <Link to='/notifications' className="relative inline-flex items-center">
            <HiBell className="w-8 h-8" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
        )}
        
        {currentUser && (
          <Dropdown label={<Avatar alt={currentUser?.name} img={currentUser?.profilePicture} rounded />} inline>
            <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
          </Dropdown>
        )}
      </div>
    </Navbar>
  );
}
