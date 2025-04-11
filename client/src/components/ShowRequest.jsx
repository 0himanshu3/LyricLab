import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ShowRequest = () => {
  const [requests, setRequests] = useState([]);
  const userId = useSelector(state => state.user.currentUser._id); // Accessing userId from Redux

  useEffect(() => {
    const fetchRequests = async () => {
      if (!userId) return; // Ensure userId is available before fetching

      try {
        const response = await fetch(`/api/request/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [userId]); // Refetch requests if userId changes

  const handleAccept = async (postId) => {
    try {
      const response = await fetch(`/api/request/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Remove the request from the local state to reflect UI update
      setRequests(prevRequests => prevRequests.filter(request => request.postId !== postId));
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (postId) => {
    try {
      const response = await fetch(`/api/request/reject`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, postId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Remove the request from the local state to reflect UI update
      setRequests(prevRequests => prevRequests.filter(request => request.postId !== postId));
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-slate-950 text-gray-200">
      <h2 className="text-2xl font-semibold mb-4">Requests</h2>
      {requests.length > 0 ? (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-gray-900 text-gray-200">
            <tr>
              <th className="py-3 px-6 text-left bg-gray-900 text-gray-200">Team Name</th>
              <th className="py-3 px-6 text-left text-gray-200">Created By</th>
              <th className="py-3 px-6 text-left text-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.postId} className="border-b text-gray-200 bg-gray-700 hover:bg-gray-50">
                <td className="py-3 px-6 text-gray-200">{request.teamName}</td>
                <td className="py-3 px-6 text-gray-200">{request.createdBy}</td>
                <td className="py-3 px-6 text-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAccept(request.postId)} 
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Accept
                    </button>
                    <button 
                      onClick={() => handleReject(request.postId)} 
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mt-4">No requests available.</p>
      )}
    </div>
  );
};

export default ShowRequest;
