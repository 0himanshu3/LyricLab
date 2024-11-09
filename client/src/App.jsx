import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import OnlyAdminPrivateRoute from './components/OnlyAdminPrivateRoute';
import CreatePost from './pages/CreatePost';
import UpdatePost from './pages/UpdatePost';
import PostPage from './pages/PostPage';
import ScrollToTop from './components/ScrollToTop';
import Search from './pages/Search';
import Notifications from './components/Notifications';
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLogin from './components/GoogleLogin';
import NotFound from './components/NotFound'
import AfterGithub from './components/AfterGithub';
import RecordAudioPage from './pages/RecordPage';
import ShowRequest from './components/ShowRequest';
import SendMail from './components/SendMail';
export default function App() {
  const user = useSelector((state) => state.user);
  const googleclientid=import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <GoogleOAuthProvider clientId={googleclientid}>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path='/' element={<SignIn />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/login' element={<GoogleLogin />} /> 
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/search' element={<Dashboard />} />
          <Route path='/after-github-login' element={<AfterGithub />} />
          <Route path='/request' element={<ShowRequest />} />
          <Route path='/sendmail' element={<SendMail />} />

          <Route element={<PrivateRoute />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          <Route element={<OnlyAdminPrivateRoute />}>
            <Route path='/create-post' element={<CreatePost />} />
            <Route path='/update-post/:postId' element={<UpdatePost />} />
          </Route>

          <Route path='/record' element={<RecordAudioPage />} />
          <Route path='/post/:postSlug' element={<PostPage />} />
          <Route path="*" element={<NotFound/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
