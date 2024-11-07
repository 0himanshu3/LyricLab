import { Sidebar } from 'flowbite-react';
import {
  HiUser,
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiAnnotation,
  HiChartPie,
  HiBell,
} from 'react-icons/hi';
import { FaTasks } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signoutSuccess } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { MdArchive } from 'react-icons/md';

export default function DashSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
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
      navigate('/');
    } catch (error) {
      console.log(error.message);
    }
  };
  
  return (
    <Sidebar className='w-full md:w-56 '>
      <Sidebar.Items className=''> 
        <Sidebar.ItemGroup className='flex flex-col gap-1 '>
          
          <Link to='/dashboard?tab=profile'>
            <Sidebar.Item
              active={tab === 'profile'}
              icon={({ className }) => (
                <HiUser className={`${tab === 'profile' ? 'text-white' : ''} ${className}`} />
              )}
              labelColor='dark'
              as='div'
            >
              Profile
            </Sidebar.Item>
          </Link>
          {currentUser && (
            <Link to='/search?tab=all'>
              <Sidebar.Item
                active={tab === 'all'}
                icon={({ className }) => (
                  <HiDocumentText className={`${tab === 'all' ? 'text-white' : ''} ${className}`} />
                )}
                as='div'
              >
                All Tasks
              </Sidebar.Item>
            </Link>
          )}
          {currentUser && (
            <>
              <Link to='/dashboard?tab=personal'>
                <Sidebar.Item
                  active={tab === 'personal'}
                  icon={({ className }) => (
                    <FaTasks className={`${tab === 'personal' ? 'text-white' : ''} ${className}`} />
                  )}
                  as='div'
                >
                  Personal Tasks
                </Sidebar.Item>
              </Link>
              <Link to='/dashboard?tab=team'>
                <Sidebar.Item
                  active={tab === 'team'}
                  icon={({ className }) => (
                    <HiOutlineUserGroup className={`${tab === 'team' ? 'text-white' : ''} ${className}`} />
                  )}
                  as='div'
                >
                  Team Tasks
                </Sidebar.Item>
              </Link>
            </>
          )}
          {currentUser.isAdmin && (
            <Link to='/search?tab=archived'>
              <Sidebar.Item
                active={tab === 'archived'}
                icon={({ className }) => (
                  <MdArchive className={`${tab === 'archived' ? 'text-white' : ''} ${className}`} />
                )}
                as='div'
              >
                Archived Tasks
              </Sidebar.Item>
            </Link>
          )}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
