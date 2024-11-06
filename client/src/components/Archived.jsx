import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import ArchivedPostCard from './ArchivedPostCard';

export default function Archived() {
  const userId = useSelector((state) => state.user.currentUser._id);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      try {
        // Fetch all posts without any filters
        const res = await fetch(`/api/post/getposts?userId=${userId}`);

        if (!res.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await res.json();
        // Filter posts with status 'archived'
        const archivedPosts = data.posts.filter(post => post.status === 'archived');
        setPosts(archivedPosts);
        setShowMore(archivedPosts.length === 9);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const res = await fetch(`/api/post/getpersonalposts?userId=${userId}&startIndex=${startIndex}`);
    
    if (res.ok) {
      const data = await res.json();
      // Filter out 'archived' posts from the newly fetched data
      const archivedPosts = data.posts.filter(post => post.status === 'archived');
      setPosts([...posts, ...archivedPosts]);
      setShowMore(archivedPosts.length === 9);
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

  const SortablePostCard = ({ post }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: post._id });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-no-dnd="true"
        className="post-card"
      >
        <PostCard post={post} />
      </div>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  return (
    <div className="flex h-screen overflow-y-auto">
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-500 p-4">
          <h1 className="text-3xl font-semibold">Archived Tasks:</h1>
        </div>

            <div className="overflow-y-auto overflow-x-hidden py-5 px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {!loading && posts.length === 0 && (
                <h1 className="text-xl text-gray-500">No archived posts found.</h1>
              )}
              {loading && <LoadingScreen />}
              {!loading &&
                posts &&
                posts.map((post) => (
                  <ArchivedPostCard key={post._id} post={post} />
                ))}
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
    </div>
  );
}
