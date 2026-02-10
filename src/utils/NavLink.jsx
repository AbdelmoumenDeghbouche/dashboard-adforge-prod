const NavLink = ({ text }) => {
  return (
    <div className="group relative flex-shrink-0">
      <span className="hover:text-indigo-600 px-1.5 sm:px-2 md:px-3 py-1.5 md:py-2 text-xs sm:text-sm md:text-base lg:text-[14px] font-medium cursor-pointer flex items-center font-roboto whitespace-nowrap">
        {text}
        <svg
          className="ml-0.5 sm:ml-1 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:rotate-180 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </div>
  );
};

export default NavLink;
