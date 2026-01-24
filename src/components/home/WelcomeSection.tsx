import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-6 text-center pt-8">
      {/* Badge */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-full shadow-sm">
        <span className="px-2 py-0.5 bg-accent-primary text-white text-xs font-semibold rounded-full">
          NEW
        </span>
        <span className="text-sm text-text-secondary">
          Create faster with Chat Mode
        </span>
        <span className="text-sm text-accent-primary font-medium cursor-pointer hover:underline">
          Try it now →
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-4xl font-bold text-text-primary">
        Let's create AI creatives, Théo 👋
      </h1>
    </div>
  );
};

export default WelcomeSection;
