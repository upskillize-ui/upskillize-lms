import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';


export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark Blue Header */}
      <header className="bg-[#1f4e79] text-white py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          {/* Left - Your Logo/Brand */}

          {/* Center - Main Title */}
          <div className="text-center">
            <div className="text-3xl font-bold tracking-wider">
              UPSKILLIZE
            </div>
            <div className="text-xs opacity-90 mt-1">Excel Beyond</div>
          </div>

          {/* Right - Badge/Certification (optional) */}
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-[1400px] grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side - Illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Background decorative elements */}
              <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
              
              {/* Main illustration */}
              <img 
                src="/logo-ipsum.jpg"
                alt="Learning illustration" 
                className="relative z-10 w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-2xl p-10">
              
              {/* Title */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Upskillize Login</h1>
                <p className="text-gray-500">Please enter your credentials and start learning!</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Login ID Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Login ID:
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                    placeholder="example@gmail.com"
                    required
                  />
                </div>

                {/* Password Input use form */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 text-gray-900"
                      placeholder="Enter Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 space-y-3 text-center">
                <Link 
                  to="/forgot-password" 
                  className="block text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                >
                  Forgot Password?
                </Link>
                <Link 
                  to="/change-password" 
                  className="block text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                >
                  Change Password?
                </Link>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}