import { Button, Select, Modal } from 'flowbite-react';
import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import LoadingScreen from '../components/LoadingScreen';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { Link } from 'react-router-dom';
import { TextInput } from 'flowbite-react';
import SortableRow from './SortableRow';

const List = ({ posts, setPosts, loading, showMore, handleShowMore, handleDelete, handleDragEnd, isModalOpen, setIsModalOpen, sidebarData, handleChange, handleSubmit, handleReset }) => {
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  const Sortable = ({ post, onDelete }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: post._id });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-no-dnd="true"
        className="post-card"
      >
        <SortableRow post={post} onDelete={onDelete} />
      </div>
    );
  };

  return (
    <div className="flex-grow flex flex-col p-4 w-full list-table">
  
    <Modal 
        show={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        className="max-w-md mx-auto bg-gray-950 text-white rounded-lg relative"
      >
        {/* Blurred background */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
        )}
        
        <div className="relative z-10">
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
                <Button type="submit" outline>Apply Filters</Button>
                <Button color="gray" onClick={handleReset} outline>Reset Filters</Button>
              </div>
            </form>
          </Modal.Body>
        </div>
      </Modal>
  
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={posts.map(post => post._id)} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto w-full px-5 max-h-[82vh]">
            <div className="bg-slate-800 border border-gray-200 w-full">
              <div className="bg-slate-500 border-b grid grid-cols-6 gap-10 p-4 font-semibold w-full">
                <div>Task Title</div>
                <div>Priority</div>
                <div>Deadline</div>
                <div>Subtasks</div>
                <div>Team</div>
                <div>Actions</div>
              </div>
              {loading ? (
                <div className="p-4 text-center">
                  <LoadingScreen />
                </div>
              ) : (
                posts.map((post) => (
                  <Sortable key={post._id} post={post} onDelete={handleDelete} />
                ))
              )}
              {posts.length === 0 && !loading && (
                <div className="p-4 text-center text-gray-500">No tasks found.</div>
              )}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default List;