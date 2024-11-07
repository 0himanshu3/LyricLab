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
    <Footer container className='bg-gray-200 text-gray-700 border border-t-1 border-gray-600 dark:bg-gray-900'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1 mb-3'>
          <div className='mt-5'>
            <Link
              to='/'
              className='self-center whitespace-nowrap text-xl sm:text-xxl font-semibold dark:text-white'
            >
              <img 
                src={theme === 'light' ? './images/logo2.jpg' : './images/mini-logo.png'} 
                alt='Lyric Lab Logo'
                className='h-7 md:h-7 lg:h-10'  
              />
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-2 mt-4 sm:grid-cols-3 sm:gap-0 '>
            <div>
              <Footer.LinkGroup col>
                <Footer.Link
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  data-value='GITHUB'
                  onMouseOver={animateLetters}
                >
                  GITHUB
                </Footer.Link>
                <Footer.Link
                  href='#'
                  data-value='DISCORD'
                  onMouseOver={animateLetters}
                >
                  DISCORD
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.LinkGroup col>
                <Footer.Link href='#' data-value='PRIVACY POLCY' onMouseOver={animateLetters}>PRIVACY POLICY</Footer.Link>
                <Footer.Link href='#'>TERMS &amp; CONDITIONS</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />

        <div className='w-full sm:flex sm:items-center sm:justify-between mt-3'>
          <Footer.Copyright href='#' by="LyricLab" year={new Date().getFullYear()} />
          <div className="flex gap-4 sm:mt-0 mt-2 sm:justify-center">
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
