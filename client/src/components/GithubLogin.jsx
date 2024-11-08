import React from 'react';
import { Button } from 'flowbite-react';
import { AiFillGithub } from 'react-icons/ai';

console.log("Gitttttt");

const GithubLogin = () => {
  const handleGithubLogin = () => {
    const redirectUri = encodeURIComponent(import.meta.env.VITE_GITHUB_CALLBACK_URI); 
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
    window.location.href = githubUrl;
  };

  return (
    <Button 
      type="button" 
      gradientDuoTone="pinkToOrange" 
      className="mt-1 w-full rounded-md border "
      onClick={handleGithubLogin}
    >
      <AiFillGithub className="w-6 h-6 mr-2" />
      Continue with GitHub
    </Button>
  );
};

export default GithubLogin;
