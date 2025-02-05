import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types/auth';
import { loginSchema } from '../schemas/auth.schema';
import { AxiosError } from 'axios';

function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
		watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

	const onSubmit = async (data: LoginCredentials) => {
		try {
			const result = await login(data.email, data.password);
			if (result) {
				// success
				toast.success('Login successful!');
				navigate('/dashboard');
			} else {
				toast.error('Invalid credentials');
			}
		} catch (err: unknown) {
			// if backend return JSON smth like: { message: string }
			// then we can use AxiosError<{ message: string }>
			const error = err as AxiosError<{ message: string }>;
			// check is it AxiosError ?
			if (error.isAxiosError && error.response?.data?.message) {
				// return error message from backend
				toast.error(error.response.data.message);
			} else {
				toast.error('Something went wrong');
			}
		}
	};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Trader Login</h2>
          <p className="text-gray-600 mt-2">Access your trading dashboard securely</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
            <p className="text-sm text-yellow-700">
              Ensure you're on the correct URL and never share your login credentials.
              Trading accounts require extra security measures.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Trading Account Email</label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="trader@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
								<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
								disabled={!watch('password')}
								>
								{showPassword ? (
									<EyeOff className="h-5 w-5 text-gray-400" />
								) : (
									<Eye className="h-5 w-5 text-gray-400" />
								)}
								</button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

					{/* 2FA */}

          {/* Remember device */}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent
                      rounded-md shadow-sm text-sm font-medium text-white bg-blue-600
                      hover:bg-blue-700 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Verifying...' : 'Sign In'}
          </button>

          {/* Forgot Password */}
          <div className="text-center">
            <a href="/reset-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;