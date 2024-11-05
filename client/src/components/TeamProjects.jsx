import { Button, Select, TextInput, Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useSensor, PointerSensor, useSensors } from '@dnd-kit/core';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        const res = await fetch(`/api/post/getteamposts?${searchQuery}`);
        
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
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);
    urlParams.set("priority", sidebarData.priority);
    urlParams.set("deadline", sidebarData.deadline);
    navigate(`/search?${urlParams.toString()}`);
    setIsModalOpen(false);
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const res = await fetch(`/api/post/getteamposts?${urlParams.toString()}`);
    
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

  
  const SortablePostCard = ({ post, onDelete }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: post._id });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-no-dnd="true"  
        className="post-card"
      >
        <PostCard post={post} onDelete={onDelete} />
      </div>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  return (
    <div className="flex h-screen overflow-y-auto">
      <div className="flex-grow flex flex-col">
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
      <label htmlFor="searchTerm" className="font-semibold">Search Term:</label>
      <TextInput
        placeholder="Search..."
        id="searchTerm"
        type="text"
        value={sidebarData.searchTerm}
        onChange={handleChange}
      />

      <label htmlFor="sort" className="font-semibold">Sort:</label>
      <Select id="sort" onChange={handleChange} value={sidebarData.sort}>
        <option value="desc">Latest</option>
        <option value="asc">Oldest</option>
      </Select>

      <label htmlFor="category" className="font-semibold">Category:</label>
      <Select id="category" onChange={handleChange} value={sidebarData.category}>
        <option value="uncategorized">All</option>
        <option value="reactjs">React.js</option>
        <option value="nextjs">Next.js</option>
        <option value="javascript">JavaScript</option>
      </Select>

      <label htmlFor="priority" className="font-semibold">Priority:</label>
      <Select id="priority" onChange={handleChange} value={sidebarData.priority}>
        <option value="all">All</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </Select>

      <label htmlFor="deadline" className="font-semibold">Deadline:</label>
      <Select id="deadline" onChange={handleChange} value={sidebarData.deadline}>
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


        {/* Scrollable Posts Grid */}
        <DndContext sensors={ sensors } onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <SortableContext items={posts.map(post => post._id)} strategy={verticalListSortingStrategy}>
            {/* <div className='w-full flex-grow overflow-y-auto'> */}
              <div className='overflow-y-auto overflow-x-hidden py-5 px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {!loading && posts.length === 0 && (
                  <h1 className='text-xl text-gray-500'>No posts found.</h1>
                )}
                {loading && <LoadingScreen />}
                {!loading &&
                  posts &&
                  posts.map((post) => (
                    <SortablePostCard key={post._id} post={post} onDelete={handleDelete} />
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
            {/* </div> */}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
