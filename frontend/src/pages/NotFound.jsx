import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-900">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mt-4">Page Not Found</p>
        <p className="text-gray-600 mt-2 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
