import { Button, Spinner, Checkbox, Modal, Label, TextInput } from 'flowbite-react';
import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import moment from 'moment';
import { useSelector } from 'react-redux';


export default function PostPage() {
  const currentUser = useSelector((state) => state.user.currentUser);
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
  const [showAddActivityPopup, setShowAddActivityPopup] = useState(false);
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');

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

  const archiveTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}/archive`, { method: 'PUT' });
      if (res.ok) navigate('/dashboard?tab=profile');

    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const addActivity = async () => {
    const newActivity = { title: activityTitle, description: activityDescription };
    const updatedActivities = [...post.activities, newActivity];
    setPost({ ...post, activities: updatedActivities });

    try {
      const res = await fetch(`/api/post/${post._id}/${currentUser._id}/add-activity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity),
      });

      if (!res.ok) throw new Error('Failed to add activity to the database');
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setShowAddActivityPopup(false);
      setActivityTitle('');
      setActivityDescription('');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );

  return (
    <div className="dark:bg-slate-950">
    <main className="p-3 max-w-6xl mx-auto min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-gray-200">
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
          <div
        className='p-3 max-w-2xl mx-auto w-full post-content'
        dangerouslySetInnerHTML={{ __html: post && post.content }}
      ></div>
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

        <div className="bg-white dark:bg-gray-900 rounded-lg p-5 shadow-lg space-y-6">
          <div className="text-center">
            <CircularProgressbar value={completionPercentage} text={`${Math.round(completionPercentage)}%`} />
            <h3 className="text-lg font-semibold mt-4">Completion Status</h3>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold mt-4">Deadline</h3>
            <p className="text-gray-800 dark:text-gray-400">{remainingTime}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subtasks</h3>
            {subtasks.map((subtask) => (
              <div key={subtask._id} className="flex items-center">
                <Checkbox
                  checked={subtask.completed}
                  onChange={() => toggleSubtaskCompletion(subtask._id)}
                  id={`subtask-${subtask._id}`}
                />
                <label htmlFor={`subtask-${subtask._id}`} className="ml-2">{subtask.title}</label>
              </div>
            ))}
            <Button color="success" onClick={completeAllSubtasks}>Complete All</Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions</h3>
            <Button color="primary" onClick={() => setShowAddActivityPopup(true)}>Add Activity</Button>
            <Button color="failure" onClick={archiveTask}>Archive Task</Button>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Activities</h3>
            <ul className="list-disc pl-5">
              {post.activities.map((activity, index) => (
                <li key={index} className="mt-2">
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p>{activity.description}</p>
                  <p>Done by: {activity.username}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Activity Popup */}
      <Modal show={showAddActivityPopup} onClose={() => setShowAddActivityPopup(false)}>
        <Modal.Header>Add Activity</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="activity-title" value="Title" />
              <TextInput
                id="activity-title"
                placeholder="Enter activity title"
                value={activityTitle}
                onChange={(e) => setActivityTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="activity-description" value="Description" />
              <TextInput
                id="activity-description"
                placeholder="Enter activity description"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={addActivity}>Add</Button>
          <Button color="failure" onClick={() => setShowAddActivityPopup(false)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </main>
    </div>
  );
}
