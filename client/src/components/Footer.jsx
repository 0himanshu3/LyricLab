import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsDribbble } from 'react-icons/bs';

export default function FooterCom() {
  const { theme } = useSelector((state) => state.theme);

  return (
    <Footer container className='border border-t-8 border-teal-500'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
          <div className='mt-5'>
            <Link
              to='/'
              className='self-center whitespace-nowrap text-xl sm:text-xxl font-semibold dark:text-white'
            >
              <img
              src={theme === 'light' ? './images/logo2.jpg' : './images/logo2dark.png'} 
              alt='Lyric Lab Logo'
              className='h-20 sm:h-[3.7rem]'  
            />
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-4 mt-4 sm:grid-cols-3 sm:gap-0'>
            <div>

              <Footer.LinkGroup col>
                <Footer.Link
                  href='/about'
                  target='_blank'
                  rel='noopener noreferrer'
                  data-value='LYRICLAB'
                >
                  LYRICLAB
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>

              <Footer.LinkGroup col>
                <Footer.Link
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  data-value='GITHUB'
                >
                  GITHUB
                </Footer.Link>
                <Footer.Link
                  href='#'
                  data-value='DISCORD'
                >
                  DISCORD</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>

              <Footer.LinkGroup col>
                <Footer.Link href='#'>PRIVACY POLICY</Footer.Link>
                <Footer.Link href='#'>TERMS &amp; CONDITIONS</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />

        <div className='w-full sm:flex sm:items-center sm:justify-between'>
          <Footer.Copyright
            href='#'
            by="LyricLab"
            year={new Date().getFullYear()}
          />
          <div className="flex gap-4 sm:mt-0 mt-2 sm:justify-center">
            <Footer.Icon href='#' icon={BsFacebook}/>
            <Footer.Icon href='#' icon={BsInstagram}/>
            <Footer.Icon href='#' icon={BsTwitter}/>
            <Footer.Icon href='https://github.com/duke107' icon={BsGithub}/>
          </div>
        </div>
      </div>
    </Footer>
  );
}
