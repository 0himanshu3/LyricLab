import { Sidebar } from 'flowbite-react';
import { HiHome, HiInformationCircle, HiSearch, HiPlusCircle, HiLogout } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';

export default function MySidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
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
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Sidebar className='w-full md:w-56'>
      <Sidebar.Items>
        <Sidebar.ItemGroup className='flex flex-col gap-1'>
          {/* Add Task button */}
          <Link to='/'>
            <Sidebar.Item
              active={tab === 'add-task'}
              icon={HiPlusCircle}
              as='div'
            >
              Add Task
            </Sidebar.Item>
          </Link>

          {/* Home */}
          <Link to='/'>
            <Sidebar.Item
              active={tab === 'home' || !tab}
              icon={HiHome}
              as='div'
            >
              Home
            </Sidebar.Item>
          </Link>

          {/* About */}
          <Link to='/about'>
            <Sidebar.Item
              active={tab === 'about'}
              icon={HiInformationCircle}
              as='div'
            >
              About
            </Sidebar.Item>
          </Link>

          {/* Search */}
          <Link to='/search'>
            <Sidebar.Item
              active={tab === 'search'}
              icon={HiSearch}
              as='div'
            >
              Search
            </Sidebar.Item>
          </Link>

          {/* Sign Out */}
          <Sidebar.Item
            icon={HiLogout}
            className='cursor-pointer'
            onClick={handleSignout}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
