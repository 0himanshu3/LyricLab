import { Button, Select, TextInput, Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import PostCard from '../components/PostCard';
import { HiAnnotation } from 'react-icons/hi';
import LoadingScreen from '../components/LoadingScreen';

export default function Search() {
  const userId = useSelector((state) => state.user.currentUser._id);

  const [sidebarData, setSidebarData] = useState({
    searchTerm: '',
    sort: 'desc',
    category: 'uncategorized',
    priority: 'all',
    deadline: 'all'
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm') || '';
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    const priorityFromUrl = urlParams.get('priority');
    const deadlineFromUrl = urlParams.get('deadline');
  
    setSidebarData(prevState => ({
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
        
        setPosts(data.posts);
        setShowMore(data.posts.length === 9);
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
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    urlParams.set("priority", sidebarData.priority);
    urlParams.set("deadline", sidebarData.deadline);
    navigate(`/search?${urlParams.toString()}`);
    setIsModalOpen(false); // Close modal on submit
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

  const handleDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  const handleReset = () => {
    const defaultData = {
      searchTerm: '',
      sort: 'desc',
      category: 'uncategorized',
      priority: 'all',
      deadline: 'all'
    };
  
    setSidebarData(defaultData);
    const urlParams = new URLSearchParams(defaultData);
    navigate(`/search?${urlParams.toString()}`);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar or Navbar can go here if needed */}
  
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-500 p-4">
          <h1 className="text-3xl font-semibold">All Tasks:</h1>
          <div className="flex">
            <Button onClick={() => setIsModalOpen(true)} className="mx-2">Filter By</Button>
            <Link to="/create-post">
              <Button>Add Task</Button>
            </Link>
          </div>
        </div>
  
        {/* Modal for Filtering */}
        <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Modal.Header>Filter Posts</Modal.Header>
          <Modal.Body>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <TextInput
                placeholder="Search..."
                id="searchTerm"
                type="text"
                value={sidebarData.searchTerm}
                onChange={handleChange}
                label="Search Term:"
              />
              <Select id="sort" onChange={handleChange} value={sidebarData.sort} label="Sort:">
                <option value="desc">Latest</option>
                <option value="asc">Oldest</option>
              </Select>
              <Select id='category' onChange={handleChange} value={sidebarData.category} label='Category:'>
                <option value='uncategorized'>All</option>
                <option value='reactjs'>React.js</option>
                <option value='nextjs'>Next.js</option>
                <option value='javascript'>JavaScript</option>
              </Select>
              <Select id="priority" onChange={handleChange} value={sidebarData.priority} label="Priority:">
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
              <Select id="deadline" onChange={handleChange} value={sidebarData.deadline} label="Deadline:">
                <option value="all">All</option>
                <option value="this_week">This Week</option>
                <option value="next_week">Next Week</option>
                <option value="this_month">This Month</option>
              </Select>
              <div className="flex gap-4">
                <Button type="submit" outline>
                  Apply Filters
                </Button>
                <Button color="gray" onClick={handleReset} outline>
                  Reset Filters
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
  
        {/* Posts Grid - scrollable container */}
        <div className="flex-grow overflow-y-scroll p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {loading && <LoadingScreen/>}
            {!loading && posts.length === 0 && (
              <h1 className="text-xl text-gray-500">No posts found.</h1>
            )}
            {!loading &&
              posts.map((post) => (
                <PostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}
          </div>
  
          {/* Show More Button */}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 text-lg hover:underline mt-6 w-full text-center"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
