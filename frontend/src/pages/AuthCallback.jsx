import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    // 1. Save token
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Fetch user from backend and save to localStorage
    api.get('/auth/me')
      .then((res) => {
        if (res.data?.success && res.data?.user) {
          const userData = res.data.user;
          localStorage.setItem('user', JSON.stringify(userData));

          // 3. Redirect based on role
          if (userData.role === 'admin') navigate('/admin');
          else if (userData.role === 'faculty') navigate('/faculty');
          else navigate('/student');
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        // Fallback: decode role from JWT if /auth/me fails
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const fakeUser = { role: payload.role, email: payload.email, id: payload.id };
          localStorage.setItem('user', JSON.stringify(fakeUser));

          if (payload.role === 'admin') navigate('/admin');
          else if (payload.role === 'faculty') navigate('/faculty');
          else navigate('/student');
        } catch {
          navigate('/login');
        }
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 text-lg font-medium">Signing you in with Google...</p>
      </div>
    </div>
  );
}