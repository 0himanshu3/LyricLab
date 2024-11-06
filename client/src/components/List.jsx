import { Button, Select, Modal } from 'flowbite-react';
import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
import { TextInput } from 'flowbite-react';

const List = ({ posts, setPosts, loading, showMore, handleShowMore, handleDelete, handleDragEnd, isModalOpen, setIsModalOpen, sidebarData, handleChange, handleSubmit, handleReset }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const priorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="flex-grow flex flex-col p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-500 mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 sm:mb-0">All Tasks:</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">Filter By</Button>
          <Link to="/create-post"><Button className="w-full sm:w-auto">Add Task</Button></Link>
        </div>
      </div>

      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md mx-auto">
        <Modal.Header>Filter Posts</Modal.Header>
        <Modal.Body>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label htmlFor="searchTerm" className="font-semibold">Search Term:</label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />

            <label htmlFor="sort" className="font-semibold">Sort:</label>
            <Select id="sort" onChange={handleChange} value={sidebarData.sort}>
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>

            <label htmlFor="category" className="font-semibold">Category:</label>
            <Select id="category" onChange={handleChange} value={sidebarData.category}>
              <option value="uncategorized">All</option>
              <option value="reactjs">React.js</option>
              <option value="nextjs">Next.js</option>
              <option value="javascript">JavaScript</option>
            </Select>

            <label htmlFor="priority" className="font-semibold">Priority:</label>
            <Select id="priority" onChange={handleChange} value={sidebarData.priority}>
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>

            <label htmlFor="deadline" className="font-semibold">Deadline:</label>
            <Select id="deadline" onChange={handleChange} value={sidebarData.deadline}>
              <option value="all">All</option>
              <option value="this_week">This Week</option>
              <option value="next_week">Next Week</option>
              <option value="this_month">This Month</option>
            </Select>

            <div className="flex gap-4">
              <Button type="submit" outline>
                Apply Filters
              </Button>
              <Button color="gray" onClick={handleReset} outline>
                Reset Filters
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="overflow-y-auto max-h-[70vh]"> {/* Add scrollable container with max height */}
          <table className="min-w-full bg-slate-800 border border-gray-200">
            <thead>
              <tr className="bg-slate-500 border-b">
                <th className="p-4 text-left font-semibold">Task Title</th>
                <th className="p-4 text-left font-semibold">Priority</th>
                <th className="p-4 text-left font-semibold">Deadline</th>
                <th className="p-4 text-left font-semibold">Subtasks</th>
                <th className="p-4 text-left font-semibold">Team</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center"><LoadingScreen /></td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="border-b hover:bg-slate-700 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                    <td className="p-4 flex items-center">
                      <div className="w-3 h-3 bg-purple-800 rounded-full mr-2"></div>
                      <Link to={`/post/${post.slug}`} className="text-teal-500 hover:underline">
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`font-semibold ${priorityColor(post.priority)}`}>
                        {post.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      {post.deadline ? new Date(post.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "No deadline"}
                    </td>
                    <td className="p-4">{post.subtasks ? post.subtasks.length : 0} Subtasks</td>
                    <td className="p-4">{post.teamName || "No team assigned"}</td>
                    <td className="p-4">
                      <Button size="small" className="bg-red-700 p-1 rounded-3xl" onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
              {posts.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
          {showMore && (
            <button onClick={handleShowMore} className="text-teal-500 text-lg hover:underline p-7 w-full">
              Show More
            </button>
          )}
        </div>
      </DndContext>
    </div>
  );
};

export default List;
