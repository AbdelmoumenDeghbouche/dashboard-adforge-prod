import React from 'react';
import WelcomeSection from '../components/home/WelcomeSection';
import MessageInputBox from '../components/home/MessageInputBox';

const HomePage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 px-4 sm:px-0">
      <WelcomeSection />
      <MessageInputBox />
    </div>
  );
};

export default HomePage;
