import React, { useState } from "react";
import NavLink from "../utils/NavLink";
import adForgeLogo from "../assets/ad_forge.svg";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav 
      className="fixed text-white bg-transparent left-2 right-2 sm:left-10 sm:right-10 md:left-10 md:right-10 lg:left-20 lg:right-20 mt-20 z-50 bg-gradient-to-r from-[#A5A5A5] from-0% to-[#FFFFFF] to-100% backdrop-blur-lg border-2 border-white/65 transition-all rounded-full duration-300 font-roboto max-w-[100vw]" 
      style={{background: 'linear-gradient(90deg, #A5A5A530 0%, #FFFFFF30 100%)'}}
    >
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
          <div className="flex-shrink-0">
            <img 
              src={adForgeLogo} 
              alt="Ad Forge" 
              className="w-20 h-20 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:mr-16"
            />
          </div>

          <div className="hidden xl:flex flex-1 justify-center">
            <div className="flex items-baseline space-x-8">
              <NavLink text="Accueil" />
              <NavLink text="À propos" />
              <NavLink text="Fonctionnalités" />
              <NavLink text="Tarifs" />
            </div>
          </div>

          <div className="hidden lg:flex xl:hidden flex-1 justify-center">
            <div className="flex items-baseline space-x-2">
              <NavLink text="Accueil" />
              <NavLink text="Fonctionnalités" />
              <NavLink text="Tarifs" />
            </div>
          </div>

          <div className="hidden md:flex lg:hidden flex-1 justify-center">
            <div className="flex items-baseline space-x-3">
              <NavLink text="Accueil" />
              <NavLink text="Tarifs" />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-3 xl:gap-4 flex-shrink-0">
            <span className="hover:text-indigo-600 px-1 sm:px-1.5 md:px-2 lg:px-2 xl:px-3 py-2 text-[10px] sm:text-xs md:text-sm lg:text-sm xl:text-base font-regular font-roboto cursor-pointer">
              Connexion
            </span>

            <button className="bg-[#23DC00] hover:bg-[#1FC700] text-white font-regular font-poppins text-[9px] sm:text-[10px] md:text-xs lg:text-sm xl:text-base px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1.5 sm:py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex-shrink-0 whitespace-nowrap">
              Essayer gratuitement
            </button>

            <button
              onClick={toggleMenu}
              className="md:hidden bg-transparent inline-flex items-center justify-center p-1 sm:p-1.5 rounded-md text-white hover:text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 flex-shrink-0"
            >
              <svg
                className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <button
              onClick={toggleMenu}
              className="hidden md:inline-flex xl:hidden bg-transparent items-center justify-center p-1.5 rounded-md text-white hover:text-gray-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/30 flex-shrink-0 mr-1"
            >
              <svg
                className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-300"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute top-14 sm:top-16 left-0 right-0 z-40 flex justify-center px-2 sm:px-4 animate-slideDown">
            <div className="w-full max-w-sm px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 rounded-2xl bg-white/95 backdrop-blur-lg shadow-xl border border-gray-200/30 transform transition-all duration-300">
              <div className="sm:hidden">
                <span className="text-gray-800 hover:text-indigo-600 block text-base font-medium cursor-pointer text-center transition-colors">Accueil</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-base font-medium cursor-pointer text-center transition-colors mt-3">À propos</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-base font-medium cursor-pointer text-center transition-colors mt-3">Fonctionnalités</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-base font-medium cursor-pointer text-center transition-colors mt-3">Tarifs</span>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <span className="text-gray-800 hover:text-indigo-600 block text-base font-medium cursor-pointer text-center transition-colors">Connexion</span>
                  <button className="w-full mt-3 bg-[#23DC00] hover:bg-[#1FC700] text-white px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg">Essayer Ad Forge gratuitement</button>
                </div>
              </div>
              <div className="hidden sm:block md:hidden">
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors">Accueil</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors mt-4">À propos</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors mt-4">Fonctionnalités</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors mt-4">Tarifs</span>
              </div>
              <div className="hidden md:block lg:hidden">
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors">À propos</span>
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors mt-4">Fonctionnalités</span>
              </div>
              <div className="hidden lg:block xl:hidden">
                <span className="text-gray-800 hover:text-indigo-600 block text-lg font-medium cursor-pointer text-center transition-colors">À propos</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;