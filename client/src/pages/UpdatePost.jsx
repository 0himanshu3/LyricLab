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
import { useState, useEffect } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';


export default function UpdatePost() {
  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [subtasks, setSubtasks] = useState([{ title: '', description: '' }]);

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getpostbyid/${postId}`);
        const data = await res.json();
  
        if (!res.ok) {
          setPublishError(data.message);
          return;
        }
  
        const post = data;
        setFormData(post);
        setSubtasks(post.subtasks || [{ title: '', description: '' }]);
        setDeadline(post.deadline ? new Date(post.deadline) : null);
  
        setPublishError(null);
      } catch (error) {
        setPublishError('Failed to fetch post details');
      }
    };
  
    fetchPost();
  }, [postId]);
  
  const handleUploadImage = async () => {
    try {
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
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentUser._id) {
        setPublishError('User not authenticated');
        return;
      }
      
      const res = await fetch(`/api/post/updatepost/${postId}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ ...formData, deadline, subtasks }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
    }
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

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-center text-3xl my-7 font-semibold'>Update Post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            value={formData.title || ''}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            value={formData.category || 'uncategorized'}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value='uncategorized'>Select a category</option>
            <option value='javascript'>JavaScript</option>
            <option value='reactjs'>React.js</option>
            <option value='nextjs'>Next.js</option>
          </Select>
        </div>
        
        <Select
          value={formData.priority || ''}
          onChange={(e) =>
            setFormData({ ...formData, priority: e.target.value })
          }
        >
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
            type='button'
            gradientDuoTone='purpleToBlue'
            size='sm'
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              'Upload Image'
            )}
          </Button>
        </div>
        
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt='upload'
            className='w-full h-72 object-cover'
          />
        )}

        <ReactQuill
          theme='snow'
          placeholder='Write something...'
          className='h-72 mb-12'
          value={formData.content || ''}
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
        />
        
        <h2 className='text-xl font-semibold'>Subtasks</h2>
        {subtasks.map((subtask, index) => (
          <div key={index} className='flex flex-col gap-2 border p-3 rounded-lg'>
            <TextInput
              type='text'
              placeholder='Subtask Title'
              value={subtask.title}
              onChange={(e) => handleSubtaskChange(index, 'title', e.target.value)}
              required
            />
            <TextInput
              type='text'
              placeholder='Subtask Description'
              value={subtask.description}
              onChange={(e) => handleSubtaskChange(index, 'description', e.target.value)}
              required
            />
            <Button type='button' onClick={() => removeSubtask(index)} color="failure">
              Remove Subtask
            </Button>
          </div>
        ))}
        <Button type='button' onClick={addSubtask}  color="success">
          Add Subtask
        </Button>

        {publishError && <Alert color='failure'>{publishError}</Alert>}
        <Button type='submit' gradientDuoTone='purpleToBlue' className='my-4'>
          Update Post
        </Button>
      </form>
    </div>
  );
}
