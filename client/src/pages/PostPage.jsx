import { Button, Spinner, Checkbox } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const toggleSubtaskCompletion = async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}/toggle-completion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setPost((prev) => ({
          ...prev,
          subtasks: prev.subtasks.map((subtask) =>
            subtask._id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const completeTask = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}/complete`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setPost((prev) => ({ ...prev, completed: true }));
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const deleteTask = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        navigate('/'); // Redirect to home or another page after deletion
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
        {post && post.title}
      </h1>
      <Link
        to={`/search?category=${post && post.category}`}
        className='self-center mt-5'
      >
        <Button color='gray' pill size='xs'>
          {post && post.category}
        </Button>
      </Link>
      <img
        src={post && post.image}
        alt={post && post.title}
        className='mt-10 p-3 max-h-[600px] w-full object-cover'
      />
      <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs'>
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className='italic'>
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>

      {/* Status and Subtasks Section */}
      <div className='p-3 max-w-2xl mx-auto w-full post-content'>
        <p className='text-sm mb-2'>
          Status: {post && post.completed ? 'Completed' : 'In Progress'}
        </p>
        <h3 className='font-semibold text-sm mb-1'>Subtasks</h3>
        {post && post.subtasks && post.subtasks.map((subtask) => (
          <div key={subtask._id} className='flex items-center gap-2'>
            <Checkbox
              checked={subtask.completed}
              onChange={() => toggleSubtaskCompletion(subtask._id)}
            />
            <span className={`text-sm ${subtask.completed ? 'line-through' : ''}`}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className='flex gap-3 mt-5 max-w-2xl mx-auto'>
        <Button color='success' onClick={completeTask} disabled={post && post.completed}>
          Complete Task
        </Button>
        <Button color='failure' onClick={deleteTask}>
          Delete Task
        </Button>
        <Link to={`/post/${post.slug}`}>
          <Button color='info'>View Full Task</Button>
        </Link>
      </div>

      <div className='p-3 max-w-2xl mx-auto w-full'>
        <div dangerouslySetInnerHTML={{ __html: post && post.content }} />
      </div>

      <div className='max-w-4xl mx-auto w-full'>
        <CallToAction />
      </div>
      <CommentSection postId={post._id} />

      <div className='flex flex-col justify-center items-center mb-5'>
        <h1 className='text-xl mt-5'>Recent articles</h1>
        <div className='flex flex-wrap gap-5 mt-5 justify-center'>
          {recentPosts && recentPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </main>
  );
}
