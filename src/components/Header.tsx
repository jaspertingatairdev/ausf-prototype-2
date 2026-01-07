import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBadgeClasses = (path: string) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-full font-medium text-sm transition-all cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className={getBadgeClasses('/admin')}
        >
          Admin
        </button>
        <button
          onClick={() => navigate('/client')}
          className={getBadgeClasses('/client')}
        >
          Client
        </button>
        <button
          onClick={() => navigate('/staff-member')}
          className={getBadgeClasses('/staff-member')}
        >
          Staff
        </button>
      </div>
    </div>
  );
};

export default Header;



