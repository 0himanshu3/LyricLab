import { Sidebar } from 'flowbite-react';
import { HiHome, HiInformationCircle, HiSearch, HiPlusCircle, HiLogout, HiOutlineLogin } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/user/userSlice';

export default function MySidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }

    const handleResize = () => {
      setIsSidebarVisible(window.innerWidth >= 768); // 768px is the breakpoint for md
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial state

    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  const customSidebar = {
    root: {
      inner: 'py-4 px-4 w-full md:w-56 h-screen text-gray-700 bg-gray-200 dark:bg-gray-900'
    }
  }

  return (
    <>
      {isSidebarVisible && (
        <Sidebar theme={customSidebar}>
          <Sidebar.Items>
            <Sidebar.ItemGroup className='flex flex-col gap-1 dark:text-white'>
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

              

              

              {/* Conditionally render other items if user is logged in */}
              {currentUser && (
                <>
                  {/* Add Task button */}
                  <Link to='/create-post'>
                    <Sidebar.Item
                      active={tab === 'add-task'}
                      icon={HiPlusCircle}
                      as='div'
                    >
                      Add Task
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
                </>
              )}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      )}
    </>
  );
}