import { Button, Select, TextInput, Modal } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useSensor, PointerSensor, useSensors } from '@dnd-kit/core';
import PostCard from '../components/PostCard';
import LoadingScreen from '../components/LoadingScreen';
import { Link } from 'react-router-dom';
const Board = ({ posts, setPosts, loading, showMore, handleShowMore, handleDelete, handleDragEnd, isModalOpen, setIsModalOpen, sidebarData, handleChange, handleSubmit, handleReset }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const SortablePostCard = ({ post, onDelete }) => {
    const { attributes, listeners, setNodeRef } = useSortable({ id: post._id });

    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        data-no-dnd="true"  
        className="post-card"
      >
        <PostCard post={post} onDelete={onDelete} />
      </div>
    );
  };

  return (
    <div className="flex-grow flex flex-col">
      <div className="flex justify-between items-center border-b border-gray-500 p-4">
        <h1 className="text-3xl font-semibold">All Tasks:</h1>
        <div className="flex">
          <Button onClick={() => setIsModalOpen(true)} className="mx-2">Filter By</Button>
          <Link to="/create-post">
            <Button>Add Task</Button>
          </Link>
        </div>
      </div>

      {/* Modal for Filtering */}
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

      {/* Scrollable Posts Grid */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <SortableContext items={posts.map(post => post._id)} strategy={verticalListSortingStrategy}>
          <div className="overflow-y-auto overflow-x-hidden py-5 px-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {!loading && posts.length === 0 && (
              <h1 className="text-xl text-gray-500">No posts found.</h1>
            )}
            {loading && <LoadingScreen />}
            {!loading &&
              posts &&
              posts.map((post) => (
                <SortablePostCard key={post._id} post={post} onDelete={handleDelete} />
              ))}
            {showMore && (
              <button
                onClick={handleShowMore}
                className="text-teal-500 text-lg hover:underline p-7 w-full"
              >;;
                Show More
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Board;
