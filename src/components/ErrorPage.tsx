import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-600 mb-8">Something went wrong. Please try again later.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

export default ErrorPage