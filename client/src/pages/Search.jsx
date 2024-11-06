import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Board from '../components/Board';
import List from '../components/List';
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
  const [viewType, setViewType] = useState('board');

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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPosts((prevPosts) =>
        arrayMove(
          prevPosts,
          prevPosts.findIndex((p) => p._id === active.id),
          prevPosts.findIndex((p) => p._id === over.id)
        )
      );
    }
  };

  // Toggle between Board and List view
  const toggleView = () => {
    setViewType((prevViewType) => (prevViewType === 'board' ? 'list' : 'board'));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 p-4">
       

        {/* View toggle buttons */}
        <button
  onClick={toggleView}
  className={`px-4 py-2 flex items-center ${
    viewType === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-slate-600'
  } rounded`}
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

      {/* Conditionally render Board or List view */}
      {viewType === 'board' ? (
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
      ) : (
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
      )}
    </div>
  );
}
