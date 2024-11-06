import React from 'react';

export default function List({
  posts,
  setPosts,
  loading,
  showMore,
  handleShowMore,
  handleDelete,
  sidebarData,
  handleChange,
  handleSubmit,
  handleReset,
}) {
  return (
    <div className="bg-white p-6 shadow-lg rounded-lg max-w-4xl mx-auto">
      {/* Filters */}
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            id="searchTerm"
            value={sidebarData.searchTerm}
            onChange={handleChange}
            placeholder="Search posts..."
            className="p-3 border border-gray-300 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Post List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-gray-600 text-xl">Loading...</div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center p-5 border-b border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <div className="col-span-4">
                <h3 className="font-semibold text-xl text-gray-800">{post.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3 mt-2">{post.content}</p>
              </div>

              <div className="flex justify-end gap-4 mt-4 md:mt-0">
                <button
                  onClick={() => handleDelete(post._id)}
                  className="text-red-500 hover:text-red-700 font-semibold text-sm transition-all duration-200 ease-in-out"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Show More Button */}
      {showMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleShowMore}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-all duration-200 ease-in-out"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
