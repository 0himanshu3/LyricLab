import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import CallToAction from '../components/CallToAction';
import Sidebar from '../components/Sidebar';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-grow p-4">
        <div className="flex flex-col gap-6 px-3 py-10 max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold lg:text-6xl text-center">Recent Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base text-center">
            {/* Optional description or subtitle */}
          </p>
        </div>

        {/* Container for Posts */}
        <div className="max-w-6xl mx-auto px-3 py-8">
          {posts && posts.length > 0 && (
            <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {posts.slice(0, 6).map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
              <Link
                to="/search"
                className="text-teal-600 dark:text-teal-400 text-lg font-semibold hover:underline"
              >
                View All Posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
