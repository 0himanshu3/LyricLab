import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useEffect, useState, Fragment, useRef } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import clsx from "clsx";
import Button from "../components/Button";
import Textbox from "../components/TextBox"; 

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [subtasks, setSubtasks] = useState([{ title: '', description: '' }]);
  const [users, setUsers] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [teamName, setTeamName] = useState(''); 
  const [modalOpen, setModalOpen] = useState(false); // Manage modal state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/user/getusers`);
    
        const data = await res.json();
        if (res.ok && data.users) {
          const formattedUsers = data.users.map(user => ({
            label: user.username,
            value: user._id,
          }));
          setUsers(formattedUsers);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchUsers();
  }, []);

  const handleCollaborateChange = (e) => {
    const shouldCollaborate = e.target.value === 'yes';
    setIsCollaborative(shouldCollaborate);
    if (!shouldCollaborate) {
      setSelectedCollaborators([]);
      setNewCollaborator('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          deadline,
          subtasks,
          isCollaborative,
          selectedCollaborators,
          teamName, // Include team name in the form data
        }),
      });
      if (res.ok) {
        navigate('/success');
      } else {
        setPublishError('Failed to publish post');
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }
    setImageUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '-' + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError('Image upload failed');
        setImageUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUploadProgress(null);
          setImageUploadError(null);
          setFormData({ ...formData, image: downloadURL });
        });
      }
    );
  };

  const handleSubtaskChange = (index, field, value) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index][field] = value;
    setSubtasks(updatedSubtasks);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', description: '' }]);
  };

  const removeSubtask = (index) => {
    const updatedSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(updatedSubtasks);
  };

  const handleCollaboratorChange = (e) => {
    setNewCollaborator(e.target.value);
  };

  const addCollaborator = () => {
    const collaborator = users.find(user => user.value === newCollaborator);
    if (collaborator && !selectedCollaborators.some(selected => selected.value === collaborator.value)) {
      setSelectedCollaborators([...selectedCollaborators, collaborator]);
      setNewCollaborator('');
    }
  };

  const removeCollaborator = (collaboratorId) => {
    setSelectedCollaborators(selectedCollaborators.filter(collaborator => collaborator.value !== collaboratorId));
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Create a Post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <Textbox
            type='text'
            placeholder='Title'
            required
            label="Title"
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Select
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
            <option value='uncategorized'>Select a category</option>
            <option value='javascript'>JavaScript</option>
            <option value='reactjs'>React.js</option>
            <option value='nextjs'>Next.js</option>
          </Select>
        </div>

          <Select
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
            <option value=''>Select Priority</option>
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </Select>

          <DatePicker
            selected={deadline}
            onChange={(date) => setDeadline(date)}
            minDate={new Date()}
            placeholderText="Select a deadline"
            className="w-full p-2 border rounded-md"
            required
          />

        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            label={imageUploadProgress ? `${imageUploadProgress || 0}%` : 'Upload Image'}
            onClick={handleUploadImage}
            className="text-sm font-medium bg-purple-500 text-white rounded px-4 py-2"
          />
        </div>

          <TextInput
            type='text'
            placeholder='Description'
            required
            id='description'
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

        <h2 className='text-xl font-semibold'>Subtasks</h2>
        {subtasks.map((subtask, index) => (
          <div key={index} className='flex flex-col gap-2 border p-3 rounded-lg'>
            <Textbox
              type='text'
              placeholder='Subtask Title'
              label="Title"
              value={subtask.title}
              onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
              required
            />
            <Textbox
              type='text'
              placeholder='Subtask Description'
              label="Description"
              value={subtask.description}
              onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
              required
            />
            <Button label="Remove Subtask" onClick={() => removeSubtask(index)} className="bg-red-500 text-white" />
          </div>
        ))}
        <Button label="Add Subtask" onClick={addSubtask} className="bg-blue-500 text-white" />

        <label className='flex items-center gap-2'>
          <input
            type='checkbox'
            onChange={handleCollaborateChange}
            value={isCollaborative ? 'no' : 'yes'}
          />
          Collaborate on this post
        </label>

        {isCollaborative && (
          <>
            <Textbox
              type='text'
              placeholder='Team Name'
              label="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
            <Select
              value={newCollaborator}
              onChange={handleCollaboratorChange}>
              <option value=''>Select Collaborators</option>
              {users.map(user => (
                <option key={user.value} value={user.value}>{user.label}</option>
              ))}
            </Select>
            <Button label="Add Collaborator" onClick={addCollaborator} className="bg-blue-500 text-white" />
            <div className='flex flex-col gap-2'>
              {selectedCollaborators.map(collaborator => (
                <div key={collaborator.value} className='flex justify-between items-center'>
                  <span>{collaborator.label}</span>
                  <Button
                    label="Remove"
                    onClick={() => removeCollaborator(collaborator.value)}
                    className="bg-red-500 text-white"
                  />
                </div>
              ))}
            </div>
          </>
        )}
        
        <Button type='submit' label="Create Post" className="bg-green-500 text-white mt-4" />
      </form>
    </div>
  );
}
