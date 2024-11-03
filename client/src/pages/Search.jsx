import { Button, Select, TextInput, Modal } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  function SortablePost({ post }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: post._id });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };
  
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="col-span-1">
        <PostCard post={post} />
      </div>
    );
  }
  

  return (
    <div className="flex h-screen overflow-hidden">
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
              <div className="flex gap-4">
                <Button type="submit" outline>Apply Filters</Button>
                <Button color="gray" onClick={handleReset} outline>Reset Filters</Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={posts.map((post) => post._id)} strategy={verticalListSortingStrategy}>
            <div className="overflow-y-auto p-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {loading ? (
                <LoadingScreen />
              ) : posts.length === 0 ? (
                <p className="text-xl text-gray-500">No posts found.</p>
              ) : (
                posts.map((post) => (
                  <SortablePost key={post._id} post={post} />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
        
        {showMore && (
          <button
            onClick={handleShowMore}
            className="text-teal-500 text-lg hover:underline p-7 w-full"
          >
            Show More
          </button>
        )}
      </div>
    </div>
  );
}

