import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../redux/theme/themeSlice';
import { signoutSuccess } from '../redux/user/userSlice';
import { useEffect, useState } from 'react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

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
      navigate('/')
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
      <Link to='/' className='flex-shrink-0 ml-4'>
        <img 
          src={theme === 'light' ? './images/logo2.jpg' : './images/logo2dark.png'} 
          alt='Lyric Lab Logo'
          className='h-5 md:h-6 lg:h-8'  
        />
      </Link>

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
        {currentUser ? (
          <Dropdown label={<Avatar alt={currentUser?.name} img={currentUser?.avatar} rounded />} inline>
            <Dropdown.Item onClick={handleSignout}>Sign Out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-up">
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Get Started
            </button>
          </Link>
        )}
      </div>
    </Navbar>
  );
}
