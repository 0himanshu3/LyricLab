import Request from "../models/request.model.js";
import Post from "../models/post.model.js";
import {Notice,UserNotice} from "../models/notification.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
export const getRequestsByUserId = async (req, res, next) => {

    try {
      const { userId } = req.params;
      // Fetch the request document by userId to get post IDs
      const userRequest = await Request.findOne({ userId });
      if (!userRequest || !userRequest.requests.length) {
        return res.status(404).json({ message: "No requests found for this user." });
      }
  
      // Extract post IDs from the request document
      const postIds = userRequest.requests;
  
      // Fetch details of each post, including team name and createdBy username
      const postsData = await Post.find({ _id: { $in: postIds } })
        .populate({
          path: "userId",
          model: "User",
          select: "username",
        })
        .select("teamName userId");
      // Format data to include team name and createdBy username
    
      const formattedRequests = postsData.map(post => ({
        postId: post._id,
        teamName: post.teamName,
        createdBy: post.userId.username,
      }));
      
      res.status(200).json(formattedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      next(error);
    }
  };
  export const acceptRequest = async (req, res) => {
    try {
      // Convert userId and postId to ObjectId
      const userId = new ObjectId(req.body.userId);
      const postId = new ObjectId(req.body.postId);
  
      // Step 1: Add the user as a collaborator in the Post
      const user = await User.findById(userId).select("username"); // Get the username only
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Step 2: Add the user as a collaborator in the Post with username as label and userId as value
      const collaboratorUpdate = {
        $addToSet: {
          collaborators: {
            label: user.username,
            value: userId.toString(),
          },
        },
      };
      
      const updatedPost = await Post.findByIdAndUpdate(postId, collaboratorUpdate, { new: true });
      
      // Step 3: If successfully added as collaborator, create a notification
      if (updatedPost) {
        const notificationText = `You have been added as a collaborator to the project "${updatedPost.teamName}" by ${updatedPost.userId.username}.`;
        const newNotice = new Notice({
          text: notificationText,
          task: postId,
          notiType: "message",
          isRead: false,
          deadline: updatedPost.deadline,
        });
  
        // Step 4: Add the new notification to the user's notifications
        let userNotice = await UserNotice.findOne({ userId });
        if (!userNotice) {
          userNotice = new UserNotice({ userId, notifications: [newNotice] });
          await userNotice.save();
        } else {
          userNotice.notifications.push(newNotice);
          await userNotice.save();
        }
      }
  
      // Step 5: Remove the request from the Request model
      await Request.findOneAndUpdate({ userId }, { $pull: { requests: postId } });
  
      res.status(200).json({ message: "User added as collaborator and notified." });
    } catch (error) {
      console.error("Error in acceptRequest:", error);
      res.status(500).json({ error: "Failed to accept request" });
    }
  };
  export const rejectRequest = async (req, res) => {
    try {
      const { userId, postId } = req.body;
  
      // Step 1: Remove the request from the Request model
      const request = await Request.findOneAndUpdate(
        { userId },
        { $pull: { requests: postId } },
        { new: true }
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }
  
      res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
      console.error('Error in rejectRequest:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };