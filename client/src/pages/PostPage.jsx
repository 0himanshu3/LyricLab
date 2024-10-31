import { Button, Spinner, Checkbox } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function PostPage() {
  const { postSlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0); // State for completion percentage

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
        setSubtasks(data.posts[0].subtasks);
        setLoading(false);
        setError(false);
        updateCompletionPercentage(data.posts[0].subtasks); // Initial percentage calculation
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  const updateCompletionPercentage = (subtasks) => {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasks.length || 1; // Prevent division by zero
    const percentage = (completedSubtasks / totalSubtasks) * 100;
    setCompletionPercentage(percentage); // Update completion percentage state
  };

  const toggleSubtaskCompletion = async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}/toggle-completion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const updatedSubtasks = subtasks.map((subtask) =>
          subtask._id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
        );
        setSubtasks(updatedSubtasks);
        updateCompletionPercentage(updatedSubtasks); // Update the completion percentage
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
    updateCompletionPercentage(updatedSubtasks); // Update the completion percentage

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
    } catch (error) {
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
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const addSubtask = () => {
    // Logic to add a new subtask, such as opening a modal or form
  };

  const updatePost = async () => {
    // Logic to update the post, such as opening a modal to edit post details or send an API request
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );

  return (
    <main className="p-3 max-w-6xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h1 className="text-3xl font-bold">{post && post.title}</h1>
            <span className="text-base font-semibold bg-gray-200 dark:bg-gray-700 p-2 rounded-md">
              Priority: {post && post.priority}
            </span>
          </div>

          <img
            src={post && post.image}
            alt={post && post.title}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
          />

          <div className="text-gray-600 dark:text-gray-400 text-sm mt-4">
            <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Content section below image and date */}
          <div className="mt-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg overflow-y-auto max-h-[350px]">
            <div dangerouslySetInnerHTML={{ __html: post && post.content }} />
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-5 shadow-lg space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Status</h3>
            <p>{completionPercentage === 100 ? 'Completed' : 'In Progress'}</p>
          </div>

          {/* Circular Progress Bar */}
          <div className="flex justify-center">
            <CircularProgressbar
              value={completionPercentage}
              text={`${Math.round(completionPercentage)}%`}
              styles={{
                path: { stroke: '#4caf50' },
                text: { fill: '#ffffff', fontSize: '20px' },
                background: { fill: '#333' },
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">Subtasks</h3>

            {/* Add Subtask and Update Post Buttons */}
            <div className="flex gap-2 mb-4">
              <Button color="info" onClick={addSubtask}>
                Add Subtask
              </Button>
              <Link className="text-teal-500 hover:underline" to={`/update-post/${post._id}`}>
                <Button color="warning">
                  <span>Update Post</span>
                </Button>
              </Link>
            </div>

            <div className="mt-2 space-y-4 max-h-[300px] overflow-y-auto scrollable">
              {subtasks.map((subtask) => (
                <div key={subtask._id} className="flex flex-col p-4 border rounded-md bg-gray-700 shadow">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => toggleSubtaskCompletion(subtask._id)}
                    />
                    <span className={`${subtask.completed ? 'line-through' : ''} text-sm font-medium`}>
                      {subtask.title}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-h-[60px] overflow-y-auto">{subtask.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Button color="success" onClick={completeTask} disabled={completionPercentage === 100} className="w-full">
              Complete All Subtasks
            </Button>
            <Button color="failure" onClick={deleteTask} className="w-full">
              Delete Task
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}