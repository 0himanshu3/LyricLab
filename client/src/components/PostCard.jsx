import { Card, Checkbox, Button, Spinner } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import moment from 'moment';

export default function PostCard({ post }) {
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState(post.subtasks || []);
  const navigate = useNavigate();
  const completedCount = subtasks.filter((subtask) => subtask.completed).length;
  const totalCount = subtasks.length;
  const completionPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;
  const [remainingTime, setRemainingTime] = useState('');
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    setLoading(false);
    startDeadlineTimer(post.deadline);
  }, []);

  const getPriorityColor = () => {
    switch (post.priority) {
      case 'high':
        return 'bg-red-700';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-green-600';
      default:
        return '';
    }
  };

  const toggleSubtaskCompletion = async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}/toggle-completion`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      if (res.ok) {
        setSubtasks((prev) => prev.map((subtask) => (subtask._id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask)));
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const completeAllSubtasks = async () => {
    console.log("triggered btn");
    const updatedSubtasks = subtasks.map((subtask) => ({ ...subtask, completed: true }));
    setSubtasks(updatedSubtasks);
    try {
      const res = await fetch(`/api/post/${post._id}/complete-subtasks`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subtasks: updatedSubtasks }) });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update subtasks in the database');
      }
    } catch (error) {
      console.error('Error updating subtasks in database:', error);
    }
  };

  const deleteTask = async () => {
    console.log("trigger delete");
    try {
      const res = await fetch(`/api/post/${post._id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.reload();
        console.log('Task deleted');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const { left, top } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Set CSS variables for mouse position
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = (e) => {
    // Reset CSS variables when mouse leaves
    const card = e.currentTarget;
    card.style.setProperty('--mouse-x', `0px`);
    card.style.setProperty('--mouse-y', `0px`);
  };

  return (
    <div 
      className='cursor-pointer'
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Card className="card max-w-sm h-[400px] w-[285px] p-1 shadow-lg transition duration-200 relative">
        <div onClick={(e) => e.stopPropagation()} className="card-content">
          <Link to={`/post/${post.slug}`}>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
          </Link>

          {/* Display team name if isCollaborative is true */}
          {post.isCollaborative && post.teamName && (
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Team: {post.teamName}
            </p>
          )}

          <Link to={`/post/${post.slug}`}>
            <div
              className={`text-sm font-bold ${getPriorityColor()} text-white px-2 py-1 rounded inline-block mb-3`}
            >
              Priority: {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)}
            </div>
          </Link>
          <Link to={`/post/${post.slug}`}>
            <p className="text-sm mb-0">
              Status: {completedCount === totalCount ? 'Completed' : `In Progress (${remainingTime})`}
            </p>
          </Link>
        </div>

        <div className="overflow-hidden mb-0 mt-0" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-semibold text-sm mb-1">Subtasks</h3>
          {subtasks.slice(0, 3).map((subtask) => (
            <div key={subtask._id} className="flex items-center gap-2 py-0.5">
              <Checkbox
                className="checkbox cursor-pointer outline-none border-none shadow-none"
                checked={subtask.completed}
                onChange={() => toggleSubtaskCompletion(subtask._id)}
              />
              <span className={`text-xs ${subtask.completed ? 'line-through' : ''}`}>
                {subtask.title}
              </span>
            </div>
          ))}
          {totalCount > 3 && <span className="text-xs text-gray-500">+{totalCount - 3} subtasks remaining</span>}
        </div>

        <div className="relative w-60 h-1.5 bg-gray-200 rounded" onClick={(e) => e.stopPropagation()}>
          <div
            className="absolute top-0 left-0 h-full bg-teal-500 rounded"
            style={{ width: `${completionPercentage}%` }}
          />
          <div className="text-xs mt-2">{completedCount}/{totalCount} Subtasks Completed</div>
        </div>

        <div className="mt-4 flex gap-2 button-container" onClick={(e) => e.stopPropagation()}>
          <Button className="bg-green-800 text-white border-none hover:bg-green-900 card-btn" onClick={completeAllSubtasks} disabled={completedCount === totalCount}>
            <span className='text-sm'>Complete Task</span>
          </Button>
          <Button className="bg-red-800 text-white border-none hover:bg-red-900 card-btn" onClick={deleteTask}>
            <span className='text-sm'>Delete Task</span>
          </Button>
        {/* <Link to={`/post/${post.slug}`}>
        <Button className="bg-teal-500 text-white">
          View Full Task
        </Button>
        </Link> */}
        </div>
      </Card>
    </div>
  );
}