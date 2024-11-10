import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Board from '../components/Board';
import List from '../components/List';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Button } from 'flowbite-react';

export default function Search() {
  const userId = useSelector((state) => state.user.currentUser._id);

  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
    priority: 'all',
    deadline: 'all',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState('board');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    const priorityFromUrl = urlParams.get('priority');
    const deadlineFromUrl = urlParams.get('deadline');

    setSidebarData((prevState) => ({
      ...prevState,
      searchTerm: searchTermFromUrl,
      sort: sortFromUrl || prevState.sort,
      category: categoryFromUrl || prevState.category,
      priority: priorityFromUrl || prevState.priority,
      deadline: deadlineFromUrl || prevState.deadline,
    }));

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = new URLSearchParams({
        ...sidebarData,
        userId,
      }).toString();

      try {
        const res = await fetch(`/api/post/getpersonalposts?${searchQuery}`);

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await res.json();
        const sortedPosts = data.posts.sort((a, b) => a.order - b.order);

        setPosts(sortedPosts);
        setShowMore(sortedPosts.length === 9);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search, userId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSidebarData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const deadlineDates = posts
    .filter((post) => post.deadline)
    .map((post) => ({
      date: new Date(post.deadline),
      slug: post.slug,
    }))
    .filter((entry) => !isNaN(entry.date));


  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', sidebarData.searchTerm);
    urlParams.set('sort', sidebarData.sort);
    urlParams.set('category', sidebarData.category);
    urlParams.set('priority', sidebarData.priority);
    urlParams.set('deadline', sidebarData.deadline);
    navigate(`/search?${urlParams.toString()}`);
    setIsModalOpen(false);
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const res = await fetch(`/api/post/getpersonalposts?${urlParams.toString()}`);

    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      setShowMore(data.posts.length === 9);
    }
  };

  const handleReset = () => {
    setSidebarData({
      searchTerm: '',
      sort: 'desc',
      category: 'uncategorized',
      priority: 'all',
      deadline: 'all',
    });
    setIsModalOpen(false);
    navigate('/dashboard?tab=personal');
    
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/post/delete/${id}`, { method: 'DELETE' });
      setPosts(posts.filter((post) => post._id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = posts.findIndex((post) => post._id === active.id);
      const newIndex = posts.findIndex((post) => post._id === over.id);
      const reorderedPosts = arrayMove(posts, oldIndex, newIndex);
      setPosts(reorderedPosts);
    
      try {
        await fetch('/api/post/update-order', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postOrder: reorderedPosts.map((post) => post._id),
          }),
        });
      } catch (error) {
        console.error('Failed to save new order:', error);
      }
    }
  };

  // Toggle between Board and List view
  const toggleView = (selectedView) => {
    setViewType(selectedView);
  };

  return (
    <div className='w-full bg-slate-950'>
      <div className="flex justify-between items-center border-b border-gray-500 p-4">
        {/* Left Section: Dropdown View Selector */}
        <div className="flex items-center bg-transparent">
          <select
            value={viewType}
            onChange={(e) => toggleView(e.target.value)}
            className="p-2 dark:bg-transparent text-white rounded appearance-none cursor-pointer"
            style={{ width: '130px' }}
          >
            <option value="board">Board View</option>
            <option value="list">List View</option>
            <option value="calendar">Calendar View</option>
          </select>
        </div>

        {/* Right Section: Filter and Add Task Buttons */}
        <div className="flex items-center space-x-4">
          <Button onClick={() => setIsModalOpen(true)} className="mx-2">Filter By</Button>
          <Link to="/create-post">
            <Button>Add Task</Button>
          </Link>
        </div>
      </div>

      {/* Conditionally render Board or List view */}
      {viewType === 'board' && (
          <div className="w-full p-4 overflow-y-auto max-h-[87vh]">
            {/* Board View */}
            <Board
              posts={posts}
              setPosts={setPosts}
              loading={loading}
              showMore={showMore}
              handleShowMore={handleShowMore}
              handleDelete={handleDelete}
              handleDragEnd={handleDragEnd}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              sidebarData={sidebarData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
            />
        </div>
      )}
      
      {viewType === 'list' && (
        <div className="w-full p-4 overflow-y-auto">
          {/* List View */}
          <List
              posts={posts}
              setPosts={setPosts}
              loading={loading}
              showMore={showMore}
              handleShowMore={handleShowMore}
              handleDelete={handleDelete}
              handleDragEnd={handleDragEnd}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              sidebarData={sidebarData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
            />
          </div>
        )}
  
        {viewType === 'calendar' && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setViewType('board')} // Clicking outside calendar closes the modal
          >
            {/* Calendar Modal */}
            <div
              className="w-full max-w-3xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl relative"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal when clicking inside
            >
              <button
                onClick={() => setViewType('board')}
                className="absolute top-1.5 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                aria-label="Close Calendar"
              >
                ✕
              </button>
              <Calendar
                tileContent={({ date }) => {
                  const post = deadlineDates.find((d) => d.date.toDateString() === date.toDateString());
                  return post ? (
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => navigate(`/post/${post.slug}`)}
                        className="bg-indigo-300 text-black font-semibold rounded-full p-1 hover:bg-indigo-500 transition duration-150 ease-in-out"
                        style={{ fontSize: '0.8rem' }}
                        aria-label="Deadline Link"
                      >
                        🔗
                      </button>
                    </div>
                  ) : null;
                }}
                tileClassName={({ date }) => {
                  const today = new Date();
                  if (date.toDateString() === today.toDateString()) {
                    return 'bg-blue-400 text-white font-bold rounded-full';
                  }
                  return 'text-gray-700 dark:text-gray-300';
                }}
                className={`w-full border border-gray-200 rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
                }`}
              />
            </div>
          </div>
        )}
    </div>
  );
}