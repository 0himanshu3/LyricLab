import { Button, Spinner, Checkbox } from 'flowbite-react';
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import moment from 'moment';

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [createdByUsername, setCreatedByUsername] = useState(null);

  const fetchUsername = useCallback(async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      setCreatedByUsername(data.username);
    } catch (error) {
      console.error("Failed to fetch username:", error);
    }
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getpostbyslug/${postSlug}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        setPost(data);
        setSubtasks(data.subtasks);
        setLoading(false);
        setError(false);
        
        if (data.isCollaborative) fetchUsername(data.userId);
        
        updateCompletionPercentage(data.subtasks);
        startDeadlineTimer(data.deadline);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug, fetchUsername]);

  const getPriorityColor = () => {
    switch (post.priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return '';
    }
  };

  const updateCompletionPercentage = (subtasks) => {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasks.length || 1;
    setCompletionPercentage((completedSubtasks / totalSubtasks) * 100);
  };

  const startDeadlineTimer = (deadline) => {
    const interval = setInterval(() => {
      const now = moment();
      const dueDate = moment(deadline);
      const duration = moment.duration(dueDate.diff(now));

      if (duration.asMilliseconds() <= 0) {
        setRemainingTime('Deadline Passed');
        clearInterval(interval);
      } else {
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        setRemainingTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
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
        updateCompletionPercentage(updatedSubtasks);
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
    updateCompletionPercentage(updatedSubtasks);

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

  const deleteTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}`, { method: 'DELETE' });
      if (res.ok) navigate('/');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );

  return (
    <main className="p-3 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-800 dark:text-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <h1 className="text-3xl font-bold">{post?.title}</h1>
            <span className={`text-base font-semibold ${getPriorityColor()} text-white px-2 py-1 rounded-md`}>
              Priority: {post && post.priority.charAt(0).toUpperCase() + post.priority.slice(1)}
            </span>
          </div>

          <img src={post?.image} alt={post?.title} className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md" />

          <div className="text-gray-800 dark:text-gray-400 text-sm mt-4">
            <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="mt-6 p-4 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg overflow-y-auto max-h-[350px]">
            <div dangerouslySetInnerHTML={{ __html: post?.content }} />
          </div>

          {/* Collaborative Feature */}
          {post?.isCollaborative && (
            <div className="mt-4 flex justify-between items-start">
              <div className="flex-1 mr-4">
                <h3 className="text-lg font-semibold">Team Name: {post.teamName}</h3>
                <Button color="info" onClick={() => setShowCollaborators(!showCollaborators)}>
                  {showCollaborators ? 'Hide Collaborators' : 'Show Collaborators'}
                </Button>
                {showCollaborators && (
                  <ul className="mt-2 list-disc pl-5">
                    {post.collaborators.map((collaborator) => (
                      <li key={collaborator._id}>{collaborator.label}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex-none">
                <h3 className="text-lg font-semibold">
                  Created By: {createdByUsername || "Loading..."}
                </h3>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-5 shadow-lg space-y-6">
          <div className="text-gray-800 dark:text-white text-sm mb-6">
            <h3 className="text-lg font-semibold">Deadline Timer</h3>
            <p>Deadline: {post && new Date(post.deadline).toLocaleDateString()}</p>
            <p>Time Remaining: {remainingTime}</p>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Status</h3>
            <p className="text-gray-800 dark:text-gray-200">{completionPercentage === 100 ? 'Completed' : 'In Progress'}</p>
          </div>

          <div className="flex justify-center">
            <div style={{ width: '80%', maxWidth: '200px' }}>
              <CircularProgressbar
                value={completionPercentage}
                text={`${Math.round(completionPercentage)}%`}
                styles={{
                  path: { stroke: '#4caf50' },
                  text: { fill: '#000000', fontSize: '20px' },
                  background: { fill: '#333' },
                }}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Subtasks</h3>
            <ul className="mt-2 space-y-2">
              {subtasks.map((subtask) => (
                <li key={subtask._id} className="flex items-center">
                  <Checkbox
                    checked={subtask.completed}
                    onChange={() => toggleSubtaskCompletion(subtask._id)}
                  />
                  <span className={`ml-2 ${subtask.completed ? 'line-through text-gray-400' : ''}`}>
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>

            <Button color="success" className="mt-4 w-full" onClick={completeAllSubtasks}>
              Complete All Subtasks
            </Button>
          </div>

          <Button color="failure" className="mt-8 w-full" onClick={deleteTask}>
            Delete Task
          </Button>
        </div>
      </div>
    </main>
  );
}
