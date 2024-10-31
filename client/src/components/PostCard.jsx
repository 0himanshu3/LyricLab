import { Card, Checkbox, Button, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function PostCard({ post }) {
  const [loading, setLoading] = useState(true);
  const [subtasks, setSubtasks] = useState(post.subtasks || []);
  const completedCount = subtasks.filter(subtask => subtask.completed).length;
  const totalCount = subtasks.length;
  const completionPercentage = totalCount ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    setLoading(false); // Stop loading when the component mounts
  }, []);

  const getPriorityColor = () => {
    switch (post.priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return '';
    }
  };

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
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  // New function to mark all subtasks as complete
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
        // Optionally handle success (e.g., show a message)
    } catch (error) {
        console.error('Error updating subtasks in database:', error);
    }
};
  

  const deleteTask = async () => {
    try {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        console.log('Task deleted');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <Card className='max-w-sm p-5 shadow-lg'>
      <Link to={`/post/${post.slug}`}>
        <h2 className='text-xl font-bold mb-2'>{post.title}</h2>
        <div className={`text-sm font-bold ${getPriorityColor()} text-white px-2 py-1 rounded inline-block mb-3`}>
          Priority: {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)}
        </div>
      </Link>

      <p className='text-sm mb-2'>
        Status: {completedCount === totalCount ? 'Completed' : 'In Progress'}
      </p>

      <div className='mb-3'>
        <h3 className='font-semibold text-sm mb-1'>Subtasks</h3>
        {subtasks.map((subtask) => (
          <div key={subtask._id} className='flex items-center gap-2'>
            <Checkbox
              checked={subtask.completed}
              onChange={() => toggleSubtaskCompletion(subtask._id)}
            />
            <span className={`text-xs ${subtask.completed ? 'line-through' : ''}`}>
              {subtask.title}
            </span>
          </div>
        ))}
        {totalCount > 2 && <span className='text-xs text-gray-500'>+ {totalCount - 2} more subtasks</span>}
      </div>

      <div className='relative w-full h-2 bg-gray-200 rounded'>
        <div
          className='absolute top-0 left-0 h-full bg-teal-500 rounded'
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <span className='text-xs'>{completedCount}/{totalCount} Subtasks Completed</span>

      <div className='mt-3 flex gap-2'>
        <Button color='success' size='sm' onClick={completeAllSubtasks}  disabled={completedCount === totalCount}> {/* Call the new function here */}
          Complete Task
        </Button>
        <Button color='failure' size='sm' onClick={deleteTask}>
          Delete Task
        </Button>
        <Link to={`/post/${post.slug}`}>
          <Button color='info' size='sm'>
            View Full Task
          </Button>
        </Link>
      </div>
    </Card>
  );
}