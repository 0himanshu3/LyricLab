import { Button, Spinner, Checkbox } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
        setPost(data.posts[0]);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, []);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchRecentPosts();
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
      const res = await fetch(`/api/post/${post._id}/complete-subtasks`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setPost((prev) => ({ ...prev, status: "completed" }));
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const deleteTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}`, {
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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );

  // Calculate completion percentage
  const completedSubtasks = post?.subtasks.filter(subtask => subtask.completed).length || 0;
  const totalSubtasks = post?.subtasks.length || 1; // Prevent division by zero
  const completionPercentage = (completedSubtasks / totalSubtasks) * 100;

  return (
    <main className="p-3 max-w-6xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Title, Priority, and Picture */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h1 className="text-4xl font-bold">{post && post.title}</h1>
            <span className="text-lg font-semibold bg-gray-200 p-2 rounded-md">
              Priority: {post && post.priority}
            </span>
          </div>

          <img
            src={post && post.image}
            alt={post && post.title}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
          />

          <div className="text-gray-600 text-sm mt-4">
            <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Right Column - Subtasks, Completion Status, Buttons */}
        <div className="bg-gray-100 rounded-lg p-5 shadow-md space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Status</h3>
            <p>{post && post.completed ? 'Completed' : 'In Progress'}</p>
          </div>

          {/* Circular Progress Bar */}
          <div className="flex justify-center">
            <CircularProgressbar
              value={completionPercentage}
              text={`${Math.round(completionPercentage)}%`}
              styles={{
                path: {
                  stroke: `#4caf50`, // Green color for the progress path
                },
                text: {
                  fill: '#333', // Color for the text
                  fontSize: '24px', // Font size for the text
                },
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Subtasks</h3>
            <div className="mt-2 space-y-4"> {/* Increased space for subtasks */}
              {post && post.subtasks && post.subtasks.map((subtask) => (
                <div key={subtask._id} className="flex flex-col p-4 border rounded-md bg-white shadow">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => toggleSubtaskCompletion(subtask._id)}
                    />
                    <span className={`${subtask.completed ? 'line-through' : ''} text-sm font-medium`}>
                      {subtask.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{subtask.description}</p> {/* Added description */}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button color="success" onClick={completeTask} disabled={post && post.completed} className="w-full">
              Complete Task
            </Button>
            <Button color="failure" onClick={deleteTask} className="w-full">
              Delete Task
            </Button>
            
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-10 p-5 bg-gray-100 rounded-lg shadow-md">
        <div dangerouslySetInnerHTML={{ __html: post && post.content }} />
      </div>
    </main>
  );
}
