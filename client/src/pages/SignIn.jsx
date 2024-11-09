import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import LoadingScreen from '../components/LoadingScreen';
import GoogleLogin from '../components/GoogleLogin';
import GithubLogin from '../components/GithubLogin';
import emailjs from "@emailjs/browser";
export default function SignInPage() {
  const [formData, setFormData] = useState({});
  const [showSignUp, setShowSignUp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVerifyFields, setShowVerifyFields] = useState(false); // For toggling verification fields
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const { loading = false, error: errorMessage = null, user = null } = useSelector((state) => state.user.currentUser || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [errorM, setErrorM] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/search?tab=profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [modalRef]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleVerificationChange = (e) => {
    setVerificationCode(e.target.value.trim());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showSignUp) {
      navigate("/sendmail");
    } else {
      if (!formData.email || !formData.password) {
        return dispatch(signInFailure('Please fill out all fields.'));
      }
      try {
        dispatch(signInStart());
        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success === false) {
          setErrorM(data.message);
          dispatch(signInFailure(data.message));
        }
        if (res.ok) {
          dispatch(signInSuccess(data));
          navigate('/search?tab=profile');
        }
      } catch (error) {
        dispatch(signInFailure(error.message));
      }
    }
  };

  const handleVerify = async () => {
    if (!email || !verificationCode) {
      alert('Please fill out both fields.');
      return;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Account verified successfully!');
        setShowVerifyFields(false); // Hide verification fields
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Verification failed, please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: "url(https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 text-center p-6">
        <h2 className="text-4xl font-bold text-slate-400 mb-4">Collaborate & Work with Your Teammates</h2>
        <p className="text-lg text-gray-200 mb-8">
          Join our platform to start collaborating and managing your projects effortlessly.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full max-w-xs mx-auto bg-gradient-to-r from-gray-500 to-slate-600"
        >
          {showSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div ref={modalRef} className="bg-slate-950 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-2xl mb-4 text-indigo-800">{showSignUp ? 'Sign Up' : 'Sign In'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {showSignUp && (
                <div>
                  <Label value="Your username" className="text-gray-600" />
                  <TextInput
                    type="text"
                    placeholder="Username"
                    id="username"
                    onChange={handleChange}
                    className="rounded-md border-orange-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <Label value="Your email" className="text-gray-600" />
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  onChange={handleChange}
                  className="rounded-md border-orange-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label value="Your password" className="text-gray-600" />
                <TextInput
                  type="password"
                  placeholder="Password"
                  id="password"
                  onChange={handleChange}
                  className="rounded-md border-orange-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                gradientDuoTone="purpleToPink"
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-md py-1 bg-gradient-to-r from-violet-700 to-gray-400"
              >
                {loading ? (
                  <>
                    <LoadingScreen/>
                  </>
                ) : (
                  showSignUp ? 'Sign Up' : 'Sign In'
                )}
              </Button>
              <div className='flex flex-col'>
                <GoogleLogin/>
                <GithubLogin/>
              </div>
              {errorM && (
                <div style={{ color: 'red' }}>{errorM}</div>
              )}
            </form>
            
            {/* Verification Button and Fields */}
            {!showVerifyFields ? (
              <Button
                gradientDuoTone="purpleToPink"
                onClick={() => setShowVerifyFields(true)}
                className="mt-4 w-full rounded-md py-1 bg-gradient-to-r from-violet-700 to-gray-400"
              >
                Verify Your Account
              </Button>
            ) : (
              <div className="mt-4">
                <Label value="Enter your email" className="text-gray-600" />
                <TextInput
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="rounded-md border-orange-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Email"
                />
                <Label value="Enter Verification Code" className="text-gray-600 mt-4" />
                <TextInput
                  type="text"
                  value={verificationCode}
                  onChange={handleVerificationChange}
                  className="rounded-md border-orange-300 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Verification Code"
                />
                <Button
                  gradientDuoTone="purpleToPink"
                  onClick={handleVerify}
                  className="mt-4 w-full rounded-md py-1 bg-gradient-to-r from-violet-700 to-gray-400"
                >
                  Verify
                </Button>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-gray-500 text-sm"
              >
                {showSignUp ? 'Already have an account? Sign In' : 'Don’t have an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
