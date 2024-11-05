import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <Navbar className='border-b-2 bg-gray-200 text-gray-700 dark:bg-gray-900'>
      <Link to={currentUser ? '/search?tab=profile' : '/'} className='flex-shrink-0 ml-4'>
        <img 
          src={theme === 'light' ? './images/logo2.jpg' : './images/logo2dark.png'} 
          alt='Lyric Lab Logo'
          className='h-5 md:h-6 lg:h-8'  
        />
      </Link>

      {/* Search Form */}
      {/* <form onSubmit={handleSubmit} className='flex items-center flex-grow justify-center mx-4'>
        <TextInput
          type='text'
          placeholder='Search...'
          rightIcon={AiOutlineSearch}
          className='hidden lg:inline'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type='submit' className='w-12 h-10 hidden' color='gray' pill>
          <AiOutlineSearch />
        </Button>
      </form> */}

      <div className='flex items-center gap-2 md:order-2'>
        <Button
          className='w-12 h-10 sm:inline text-white'
          color='gray'
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'light' ? <FaSun /> : <FaMoon />}
        </Button>
        
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
          <Dropdown label={<Avatar alt={currentUser?.name} img={currentUser?.avatar} rounded />} inline>
            <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
          </Dropdown>
        //  : (
        //   <Link to="/sign-up">
        //     <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        //       Get Started
        //     </button>
        //   </Link>
        )}
      </div>
    </Navbar>
  );
}
