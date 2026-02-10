import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActionCardNew from './ActionCardNew';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Créer une Vidéo',
      description: 'Générer une nouvelle publicité avec l\'IA',
      topGradient: 'linear-gradient(0deg, rgba(81, 162, 255, 0.1), rgba(81, 162, 255, 0.3))',
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      ),
      action: () => navigate('/generation')
    },
    {
      title: 'Importer Produits',
      description: 'Synchroniser depuis Shopify/WooCommerce',
      topGradient: 'linear-gradient(0deg, rgba(187, 30, 234, 0.1), rgba(187, 30, 234, 0.2))',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      action: () => navigate('/ingestion', { state: { tab: 'manual' } })
    },
    {
      title: 'Analyser Tendances',
      description: 'Découvrir les contenus viraux du moment',
      topGradient: 'linear-gradient(0deg, rgba(35, 220, 0, 0.1), rgba(35, 220, 0, 0.2))',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      action: () => console.log('Analyser Tendances - Coming soon')
    },
    {
      title: 'Cibler Audience',
      description: 'Optimiser votre ciblage avec l\'IA',
      topGradient: 'linear-gradient(0deg, rgba(255, 221, 0, 0.1), rgba(255, 221, 0, 0.2))',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      action: () => console.log('Cibler Audience - Coming soon')
    }
  ];

  return (
    <div className="mb-6 lg:mb-8 max-w-4xl">
      <h2 className="text-white text-lg sm:text-xl font-poppins font-semibold mb-4">Actions Rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 lg:gap-8">
        {actions.map((action, index) => (
          <ActionCardNew 
            key={index} 
            title={action.title}
            description={action.description}
            topGradient={action.topGradient}
            icon={action.icon}
            onClick={action.action}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

