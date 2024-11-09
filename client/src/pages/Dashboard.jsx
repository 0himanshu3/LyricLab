import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import DashProfile from '../components/DashProfile';
import Personal from '../components/Personal';
import TeamProjects from '../components/TeamProjects';
import Search from './Search';
import Archived from '../components/Archived';
import CanvasPost from '../components/CanvasPost';

export default function Dashboard() {
  const location = useLocation();
  const [tab, setTab] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  return (
    <div className='min-h-screen flex flex-row'>
      <div>
        {/* Sidebar */}
        <DashSidebar />
      </div>
      {/* profile... */}
      {tab === 'profile' && <DashProfile />}
      {/* posts... */}
      {tab === 'all' && <Search />}
      {/* users */}
      {tab === 'personal' && <Personal />}
      {/* comments  */}
      {tab === 'team' && <TeamProjects/>}
      {/* dashboard comp */}
      {tab === 'dash' && <DashboardComp />}

      {tab === 'archived' && <Archived />}
      {tab === 'canvas' && <CanvasPost />}
    </div>
  );
}
