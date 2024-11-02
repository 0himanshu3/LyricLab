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
import { Dialog, Transition } from "@headlessui/react"; // Import Dialog and Transition

const ModalWrapper = ({ open, setOpen, children }) => {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={open} as={Fragment}>
  <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setOpen(false)}>
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
    </Transition.Child>

    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div className="flex h-full items-center justify-center p-4 text-center sm:p-0">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <Dialog.Panel className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition.Root>

  );
};

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
        const res = await fetch(`/api/user/getallusers`);
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
          teamName,
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
      <Button color='success' className='bg-green-500 hover:bg-green-600 text-white' onClick={() => setModalOpen(true)}>
  Open Create Post Form
</Button>
      
      <ModalWrapper open={modalOpen} setOpen={setModalOpen}>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Title'
              required
              id='title'
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

          <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dashed p-3 rounded-md'>
            <div className='flex-1'>
              <FileInput onChange={(e) => setFile(e.target.files[0])} />
              {imageUploadProgress && (
                <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress}%`} />
              )}
              {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
            </div>
            <Button color='success' className="text-xs" onClick={handleUploadImage}>Upload Image</Button>
          </div>

          <TextInput
            type='text'
            placeholder='Description'
            required
            id='description'
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div>
            <h2 className='text-lg'>Subtasks</h2>
            {subtasks.map((subtask, index) => (
              <div key={index} className='flex gap-2'>
                <TextInput
                  type='text'
                  placeholder='Subtask Title'
                  value={subtask.title}
                  onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
                />
                <TextInput
                  type='text'
                  placeholder='Subtask Description'
                  value={subtask.description}
                  onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
                />
               <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => removeSubtask(index)}>
          Remove
        </Button>
              </div>
            ))}
            <Button className="bg-green-500 hover:bg-green-600" onClick={addSubtask} >Add Subtask</Button>
          </div>

          <div>
            <label htmlFor='collaborate' className='block'>Collaborate</label>
            <Select id='collaborate' onChange={handleCollaborateChange}>
              <option value='no'>No</option>
              <option value='yes'>Yes</option>
            </Select>
            {isCollaborative && (
              <div className='flex flex-col'>
                <h3 className='text-lg'>Select Collaborators</h3>
                {selectedCollaborators.map(collaborator => (
                  <div key={collaborator.value} className='flex items-center'>
                    <span>{collaborator.label}</span>
                    <Button onClick={() => removeCollaborator(collaborator.value)}>Remove</Button>
                  </div>
                ))}
                <Select onChange={handleCollaboratorChange} value={newCollaborator}>
                  <option value=''>Add Collaborator</option>
                  {users.map(user => (
                    <option key={user.value} value={user.value}>{user.label}</option>
                  ))}
                </Select>
                <Button className='bg-green-500 hover:bg-green-600'color='success' onClick={addCollaborator}>Add</Button>
              </div>
            )}
          </div>

          {publishError && <Alert color='failure'>{publishError}</Alert>}
        <Button type='submit' className="bg-green-500 hover:bg-green-600 text-white">
          Publish
        </Button>
        </form>
      </ModalWrapper>
    </div>
  );
}
