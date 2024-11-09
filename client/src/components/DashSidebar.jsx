import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import {
  HiUser,
  HiDocumentText,
  HiOutlineUserGroup,
  HiMenuAlt1
} from 'react-icons/hi';
import { FaTasks } from 'react-icons/fa';
import { MdArchive } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function DashSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState('');
  const [loading, setLoading] = useState('true');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    setLoading(false);
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  // Toggle sidebar collapse based on window width
  useEffect(() => {
    const handleResize = () => {
      let w = window.innerWidth;
      setCollapsed((w <= 1160 && w >= 1020) || (w <= 875 && w >= 770) || w <= 520);
    };
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', { method: 'POST' });
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
    <Sidebar
      collapsed={collapsed}
      width="{collapsed ? '10px' : '17vw'}"
      className={`${loading ? 'hidden' : ''} min-h-screen bg-gray-950 text-white transition-all duration-300`}
    >
      <Menu iconShape="square" className='bg-gray-950 outline-none border-none'>
        <MenuItem
          active={tab === 'profile'}
          icon={<HiUser className={`${tab === 'profile' ? 'text-blue-500' : ''}`} />}
          className={`${
            tab === 'profile' ? 'text-blue-400' : 'hover:text-blue-700'
            } transition-colors duration-200`}
            component={<Link to="/dashboard?tab=profile" />}
        >Profile
        </MenuItem>

        {currentUser && (
          <MenuItem
            active={tab === 'all'}
            icon={<HiDocumentText className={`${tab === 'all' ? 'text-blue-500' : ''}`} />}
            className={`${
              tab === 'all' ? 'text-blue-400' : 'hover:text-blue-700'
              } transition-colors duration-200`}
              component={<Link to="/search?tab=all" />}
          > All Tasks
          </MenuItem>
        )}

        {currentUser && (
          <>
            <MenuItem
              active={tab === 'personal'}
              icon={<FaTasks className={`${tab === 'personal' ? 'text-blue-500' : ''}`} />}
              className={`${
                tab === 'personal' ? 'text-blue-400' : 'hover:text-blue-700'
                } transition-colors duration-200`}
                component={<Link to="/dashboard?tab=personal" />}
            > Personal Tasks
            </MenuItem>
            <MenuItem
              active={tab === 'team'}
              icon={<HiOutlineUserGroup className={`${tab === 'team' ? 'text-blue-500' : ''}`} />}
              className={`${
                tab === 'team' ? 'text-blue-400' : 'hover:text-blue-700'
                } transition-colors duration-200`}
                component={<Link to="/dashboard?tab=team" />}
            > Team Tasks
            </MenuItem>
          </>
        )}

        {currentUser.isAdmin && (
          <MenuItem
            active={tab === 'archived'}
            icon={<MdArchive className={`${tab === 'archived' ? 'text-blue-500' : ''}`} />}
            className={`${
              tab === 'archived' ? 'text-blue-400' : 'hover:text-blue-700'
              } transition-colors duration-200`}
              component={<Link to="/dashboard?tab=archived" />}
          > Archived Tasks
          </MenuItem>
        )}
        
      </Menu>
    </Sidebar>
  );
}
