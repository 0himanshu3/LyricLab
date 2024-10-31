import { Button, Spinner, Checkbox } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
// import { completeTask } from '../../../api/controllers/post.controller';

export default function PostPage() {
  const { postSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [subtasks, setSubtasks] = useState([]); // Added state for subtasks

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
        setSubtasks(data.posts[0].subtasks); // Initialize subtasks
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  // Fetch recent posts logic...

  const toggleSubtaskCompletion = async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}/toggle-completion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setSubtasks((prev) =>
          prev.map((subtask) =>
            subtask._id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
          )
        );
      } else {
        console.error('Failed to toggle subtask completion:', await res.json());
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const completeAllSubtasks = async () => {
    const updatedSubtasks = subtasks.map((subtask) => ({ ...subtask, completed: true }));
    setSubtasks(updatedSubtasks);

    try {
      const res = await fetch(`/api/post/${post._id}/complete-subtasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update subtasks in the database');
      }
    }
    catch (error) {
      console.error('Error updating subtasks in database:', error);
    }
  };

  const completeTask = () => {
    completeAllSubtasks(); // Call the function to complete all subtasks
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

  // Calculate completion percentage logic...

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

          {/* Circular Progress Bar logic... */}

          <div>
            <h3 className="text-lg font-semibold">Subtasks</h3>
            <div className="mt-2 space-y-4">
              {subtasks.map((subtask) => (
                <div key={subtask._id} className="flex flex-col p-4 border rounded-md shadow">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => toggleSubtaskCompletion(subtask._id)}
                    />
                    <span className={`${subtask.completed ? 'line-through' : ''} text-sm font-medium`}>
                      {subtask.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{subtask.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button color="success" onClick={completeTask} disabled={post && post.completed} className="w-full">
              Complete All Subtasks
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
