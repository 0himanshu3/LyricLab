import { Button, Select, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import PostCard from '../components/PostCard';

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
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === "category") {
      setSidebarData({ ...sidebarData, category: e.target.value });
    }
    if (e.target.id === "priority") {
      setSidebarData({ ...sidebarData, priority: e.target.value });
    }
    if (e.target.id === "deadline") {
      setSidebarData({ ...sidebarData, deadline: e.target.value });
    }
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
      category: 'all',
      priority: 'all',
      deadline: 'all'
    };
  
    // Update `sidebarData` with default values
    setSidebarData(defaultData);
  
    // Update the URL with the default filter values
    const urlParams = new URLSearchParams({
      searchTerm: defaultData.searchTerm,
      sort: defaultData.sort,
      category: defaultData.category,
      priority: defaultData.priority,
      deadline: defaultData.deadline,
    });
    navigate(`/search`);
  };
  

  return (
    <div className='flex flex-col md:flex-row'>
      <div className='p-7 border-b md:border-r md:min-h-screen border-gray-500'>
        <form className='flex flex-col gap-8' onSubmit={handleSubmit}>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Search Term:</label>
            <TextInput
              placeholder='Search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Sort:</label>
            <Select id='sort' onChange={handleChange} value={sidebarData.sort}>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Category:</label>
            <Select id='category' onChange={handleChange} value={sidebarData.category}>
            <option value='all'>All</option>
              <option value='reactjs'>React.js</option>
              <option value='nextjs'>Next.js</option>
              <option value='javascript'>JavaScript</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Priority:</label>
            <Select id='priority' onChange={handleChange} value={sidebarData.priority}>
              <option value='all'>All</option>
              <option value='high'>High</option>
              <option value='medium'>Medium</option>
              <option value='low'>Low</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='font-semibold'>Deadline:</label>
            <Select id='deadline' onChange={handleChange} value={sidebarData.deadline}>
              <option value='all'>All</option>
              <option value='this_week'>This Week</option>
              <option value='next_week'>Next Week</option>
              <option value='this_month'>This Month</option>
            </Select>
          </div>
          <div className='flex gap-4'>
            <Button className='bg-cyan-400' type='submit' outline>
              Apply Filters
            </Button>
            <Button color='gray' onClick={handleReset} outline>
              Reset Filters
            </Button>
          </div>
        </form>
      </div>
      <div className='w-full'>
        <h1 className='text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5'>Posts results:</h1>
        <div className='p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
          {loading && <p className='text-xl text-gray-500'>Loading...</p>}
          {!loading && posts.length === 0 && (
            <p className='text-xl text-gray-500'>No posts found.</p>
          )}
          {!loading &&
            posts.map((post) => (
                <PostCard post={post} onDelete={handleDelete} />
            ))}
          {showMore && (
            <button
              onClick={handleShowMore}
              className='text-teal-500 text-lg hover:underline p-7 w-full'
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
