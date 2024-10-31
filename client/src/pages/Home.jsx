import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import CallToAction from '../components/CallToAction';

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="flex flex-col gap-6 px-3 py-10 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold lg:text-6xl text-center">Welcome to My Blog</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base text-center">
          Discover a variety of articles and tutorials on topics like web development, software engineering, and programming languages.
        </p>
        <Link
          to="/search"
          className="text-teal-600 dark:text-teal-400 text-sm sm:text-base font-bold hover:underline text-center"
        >
          View All Posts
        </Link>
      </div>

      {/* Container for Posts */}
      <div className="max-w-6xl mx-auto px-3 py-8">
        {posts && posts.length > 0 && (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-semibold text-center">Recent Tasks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {posts.map((post) => (
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
  );
}
