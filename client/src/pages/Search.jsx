import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Board from '../components/Board';
import List from '../components/List';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";

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
  const [viewType, setViewType] = useState('board'); // 'board' or 'list'
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

    // Detect if dark mode is enabled
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = new URLSearchParams({
        ...sidebarData,
        userId,
      }).toString();

      try {
        const res = await fetch(`/api/post/getposts?${searchQuery}`);

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

  const toggleView = () => {
    setViewType((prevViewType) => (prevViewType === 'board' ? 'list' : 'board'));
  };

  const handleSubmit = (e) => {
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
    const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);

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
    navigate('/search');
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

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header with Toggle Button */}
      <div className="flex justify-between items-center p-4">
        <button
          onClick={toggleView}
          className={`px-4 py-2 flex items-center ${
            viewType === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-slate-600'
          } rounded transition-colors duration-200`}
        >
          {viewType === 'board' ? (
            <>
              <FaList className="mr-2" />
              List View
            </>
          ) : (
            <>
              <MdGridView className="mr-2" />
              Board View
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex">
        {viewType === 'board' ? (
          <div className="flex w-full">
            {/* Board View */}
            <div className="w-2/3 p-4 overflow-y-auto">
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
            {/* Calendar */}
            <div className="w-1/3 p-4">
              <Calendar
                tileContent={({ date }) => {
                  const post = deadlineDates.find((d) => d.date.toDateString() === date.toDateString());
                  return post ? (
                    <button
                      onClick={() => navigate(`/post/${post.slug}`)}
                      className="w-full h-full bg-yellow-200 text-black font-semibold rounded-full p-1 hover:bg-yellow-300"
                    >
                      🔗
                    </button>
                  ) : null;
                }}
                className={`border border-gray-200 rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="flex w-full">
            {/* List View */}
            <div className="w-2/3 p-4 overflow-y-auto">
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
            {/* Calendar */}
            <div className="w-1/3 p-4">
              <Calendar
                tileContent={({ date }) => {
                  const post = deadlineDates.find((d) => d.date.toDateString() === date.toDateString());
                  return post ? (
                    <button
                      onClick={() => navigate(`/post/${post.slug}`)}
                      className="w-full h-full bg-yellow-200 text-black font-semibold rounded-full p-1 hover:bg-yellow-300"
                    >
                      🔗
                    </button>
                  ) : null;
                }}
                className={`border border-gray-200 rounded-lg shadow-lg ${
                  isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}