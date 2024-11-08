import { Card, Button, Spinner } from 'flowbite-react';
import { useState, useEffect } from 'react';
import moment from 'moment';

export default function ArchivedPostCard({ post }) {
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState(post.subtasks || []);
  const completedCount = subtasks.filter((subtask) => subtask.completed).length;
  const totalCount = subtasks.length;
  const completionPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    setLoading(false);
    startDeadlineTimer(post.deadline);
  }, []);

  

  const restoreTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}/restore`, { method: 'PUT' });
      if (res.ok) {
        window.location.reload();
        console.log('Task restored');
      }
    } catch (error) {
      console.error('Failed to restore task:', error);
    }
  };

  const permanentlyDeleteTask = async () => {
    try {
      const res = await fetch(`/api/post/${post._id}`, { method: 'DELETE' });
      if (res.ok) {
        window.location.reload();
        console.log('Task permanently deleted');
      }
    } catch (error) {
      console.error('Failed to permanently delete task:', error);
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

  return (
    <div className=''>
      <Card className="card dark:bg-transparent max-w-sm h-[400px] w-[285px] p-1 transition duration-200 relative">
        <div className="card-content text-center">
          <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        </div>
 
        <div className="overflow-hidden mb-0 mt-0">
          <h3 className="font-semibold text-sm mb-1">Subtasks</h3>
          <ul>
            {subtasks.slice(0, 3).map((subtask) => (
              <li key={subtask._id} className="text-xs mb-1">
                <span className={`${subtask.completed ? 'line-through' : ''}`}>
                  {subtask.title}
                </span>
              </li>
            ))}
          </ul>
          {totalCount > 3 && <span className="text-xs text-gray-500">+{totalCount - 3} subtasks</span>}
        </div>

        <div className="mt-4 flex flex-col gap-2 button-container">
          <Button className="bg-blue-800 text-white border-none hover:bg-blue-900 card-btn" onClick={restoreTask}>
            <span className='text-sm'>Restore Task</span>
          </Button>
          <Button className="bg-red-800 text-white border-none hover:bg-red-900 card-btn" onClick={permanentlyDeleteTask}>
            <span className='text-sm'>Permanently Delete</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
