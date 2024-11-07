import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub } from 'react-icons/bs';
import { useEffect } from 'react';

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function FooterCom() {
  const { theme } = useSelector((state) => state.theme);

  // Letter animation function
  const animateLetters = (event) => {
    let iteration = 0;
    const originalText = event.target.dataset.value;
    let interval = setInterval(() => {
      event.target.innerText = originalText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (iteration >= originalText.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);
  };

  return (
    <Footer container className='bg-gray-200 text-gray-700 border border-t-1 border-gray-600 dark:bg-gray-950 rounded-none'>
    <div className='w-full max-w-7xl mx-auto'>    
    <div className='w-full sm:flex sm:items-center sm:justify-between'>
      <Footer.Copyright href='#' by="LyricLab" year={2024} />
      <div className="flex gap-4 sm:mt-0 sm:justify-center">
        <Link to='/'>
          <img 
            src={theme === 'light' ? './images/logo2.jpg' : './images/mini-logo.png'} 
            alt='Lyric Lab Logo'
            className='h-6 w-6'  
          />
        </Link>
        <Footer.Icon href='#' icon={BsFacebook} />
        <Footer.Icon href='#' icon={BsInstagram} />
        <Footer.Icon href='#' icon={BsTwitter} />
        <Footer.Icon href='https://github.com/duke107' icon={BsGithub} />
      </div>
    </div>
  </div>
</Footer>

  );
}
