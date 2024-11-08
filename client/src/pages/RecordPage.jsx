import { Alert, Button, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [pastRecordings, setPastRecordings] = useState([]);
  const navigate = useNavigate();
  const userid = useSelector((state) => state.user.currentUser._id);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const quillRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const [audioURL, setAudioURL] = useState(null);

  useEffect(() => {
    fetchPastRecordings(); // Fetch past recordings on mount
  }, []);

  const fetchPastRecordings = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/recordings/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const recordings = await res.json();
        setPastRecordings(recordings);
      }
    } catch (error) {
      console.log("Failed to fetch past recordings");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (isRecording)
      stopRecording();

    const formData = new FormData();
    formData.append('title', formData.title);
    formData.append('audio', file);
    formData.append('transcription', transcript);

    try {
      const res = await fetch('/api/recordings/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        fetchPastRecordings(); // Refresh recordings after upload
        navigate(`/recordings`);
      }
      else {
        setPublishError('Failed to save recording');
        console.log(error);
      }
    }
    catch (error) {
      setPublishError('Something went wrong');
    }
  };  

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    startRecording(lang);
    setShowDropdown(false);
  };

    useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-UK';

          // Event to process speech results
          recognitionRef.current.onresult = (event) => {
              let interimTranscript = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                  const currentResult = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                      // Add final results to the complete transcript
                      finalTranscriptRef.current += currentResult + ' ';
                      setTranscript(finalTranscriptRef.current);
                  } else {
                      interimTranscript += currentResult;
                  }
              }
              setTranscript(finalTranscriptRef.current + interimTranscript);
          };

          recognitionRef.current.onerror = (event) => {
              console.error("Error occurred in speech recognition:", event.error);
          };
      }
      else {
          alert("Web Speech API is not supported in this browser.");
      }
    },
  [] );

  const startRecording = () => {
    if (recognitionRef.current) {
      finalTranscriptRef.current = quillRef.current.getEditor().getText();
      // recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
        const blob = new Blob([transcript], { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    else {
      toggleDropdown();
    }
  };

  // Update ReactQuill editor whenever the transcript changes
  useEffect(() => {
      if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.setText(transcript); // Set text directly in the editor
      }
  }, [transcript]);

  return (
    <div className='bg-slate-950'>
      <div className='p-3 max-w-3xl mx-auto min-h-screen bg-slate-950'>
        <h1 className='text-center text-3xl my-7 font-semibold'>Create a Project</h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <ReactQuill
            onChange={(value) => setFormData({ ...formData, content: value })}
            theme="snow"
            placeholder="Express Yourself..."
            className="h-72 mb-12 text-gray-200"
            ref={quillRef}
          />

          {/* Record button */}
          <Button onClick={isRecording ? stopRecording : startRecording} color="purple">
            {isRecording ? "Stop" : "Record"}
          </Button>

          <Button type='submit' gradientDuoTone='greenToBlue' className='bg-teal-700'>
            Publish Post
          </Button>

          {publishError && <Alert color='failure'>{publishError}</Alert>}
        </form>

        {/* Display past recordings */}
        <div>
          <h1 className='text-3xl text-gray-200'>Past Recordings</h1>
          {pastRecordings.map((recording) => (
            <div key={recording._id} className="my-2">
              <p>{recording.title}</p>
              <audio controls src={recording.filePath}></audio>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



/*
import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React, { useEffect, useState, useRef } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const userid = useSelector((state) => state.user.currentUser._id);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const quillRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const [language, setLanguage] = useState('en-UK');
  const [showDropdown, setShowDropdown] = useState(false);
  const [audioURL, setAudioURL] = useState(null);

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(/api/user/getallusers);
        const data = await res.json();
        if (res.ok && data) {
          const formattedUsers = data
            .filter(user => user._id !== userid)
            .map(user => ({
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

   
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (isRecording) stopRecording();
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio', file); 
    formData.append('transcription', transcript); 
  
    try {
      const res = await fetch('/recordings/create', {
        method: 'POST',
        headers: {
          Authorization: Bearer ${token},
        },
        body: formData,
      });
  
      if (res.ok) {
        navigate(/recordings); // Adjust the route based on your app
      } else {
        setPublishError('Failed to save recording');
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };
  

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    startRecording(lang);
    setShowDropdown(false);
  };

    useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = language;

          // Event to process speech results
          recognitionRef.current.onresult = (event) => {
              let interimTranscript = '';
              for (let i = event.resultIndex; i < event.results.length; i++) {
                  const currentResult = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                      // Add final results to the complete transcript
                      finalTranscriptRef.current += currentResult + ' ';
                      setTranscript(finalTranscriptRef.current);
                  } else {
                      interimTranscript += currentResult;
                  }
              }
              setTranscript(finalTranscriptRef.current + interimTranscript);
          };

          recognitionRef.current.onerror = (event) => {
              console.error("Error occurred in speech recognition:", event.error);
          };
      } else {
          alert("Web Speech API is not supported in this browser.");
      }
  }, []);

  const startRecording = (lang) => {
    if (recognitionRef.current) {
      finalTranscriptRef.current = quillRef.current.getEditor().getText();
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
        const blob = new Blob([transcript], { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
    }
  };


  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    else {
      toggleDropdown();
    }
  };

  // Update ReactQuill editor whenever the transcript changes
  useEffect(() => {
      if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.setText(transcript); // Set text directly in the editor
      }
  }, [transcript]);

  return (
      <div className='bg-slate-950'>
      <div className='p-3 max-w-3xl mx-auto min-h-screen bg-slate-950'>
        <h1 className='text-center text-3xl my-7 font-semibold'>Create a Project</h1>
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
          </div>
          
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <ReactQuill
          onChange={(value) => setFormData({ ...formData, content: value })}
              theme="snow"
              placeholder="Express Yourself..."
              className="h-72 mb-12 text-gray-200"
              ref={quillRef}
          />

        <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
            <button
                onClick={handleToggleRecording}
                style={{
                    backgroundColor: isRecording ? '#ff4c4c' : '#4c6ef5',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    position: 'relative',
                }}
            >
                {isRecording ? "Stop" : "Record"}
            </button>

            {showDropdown && !isRecording && (
                <div style={{
                    position: 'absolute',
                    top: '-90px',
                    right: '0',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    zIndex: 1,
                }}>
                    <button
                      onClick={() => handleLanguageSelect('en-US')}
                      style={{
                          display: 'block',
                          padding: '10px',
                          width: '100%',
                          backgroundColor: '#4c6ef5',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                      }}
                  >
                      English
                  </button>
                  <button
                      onClick={() => handleLanguageSelect('hi-IN')}
                      style={{
                          display: 'block',
                          padding: '10px',
                          width: '100%',
                          backgroundColor: '#4c6ef5',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                      }}
                  >
                      Hindi
                  </button>
                </div>
                )}
            </div>
        </div>

          <Button type='submit' gradientDuoTone='greenToBlue' className='bg-teal-700'>
            Publish Post
          </Button>

          {publishError && <Alert color='failure'>{publishError}</Alert>}
        </form>
      <div>
          <h1 className='text-3xl text-gray-200'>Past Recordings</h1>
      </div>
      </div>
      </div>
    );
}
*/