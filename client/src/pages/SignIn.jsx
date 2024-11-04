import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import LoadingScreen from '../components/LoadingScreen';

export default function SignInPage() {
  const [formData, setFormData] = useState({});
  const [showSignUp, setShowSignUp] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading = false, error: errorMessage = null, user = null } = useSelector((state) => state.user.currentUser || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showSignUp) {
      if (!formData.username || !formData.email || !formData.password) {
        return dispatch(signInFailure('Please fill out all fields.'));
      }
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success === false) {
          return dispatch(signInFailure(data.message));
        }
        navigate('/sign-in');
      } catch (error) {
        dispatch(signInFailure(error.message));
      }
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-slate-900 rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-2xl mb-4 text-blue-800">{showSignUp ? 'Sign Up' : 'Sign In'}</h2>
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
                className="mt-4 w-full rounded-md py-2 bg-gradient-to-r from-violet-700 to-gray-400"
              >
                {loading ? (
                  <>
                    <LoadingScreen/>
                  </>
                ) : (
                  showSignUp ? 'Sign Up' : 'Sign In'
                )}
              </Button>
              <OAuth />
            </form>
            <div className="flex gap-2 text-sm mt-5 justify-center">
              <span className="text-gray-500">
                {showSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-blue-500 underline"
              >
                {showSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
            {errorMessage && (
              <Alert className="mt-5" color="failure">
                {errorMessage}
              </Alert>
            )}
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="mt-4 text-red-500"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
