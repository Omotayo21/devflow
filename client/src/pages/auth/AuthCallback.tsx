import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { Spinner } from '../../components/ui/Spinner';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const token = searchParams.get('token');

  useEffect(() => {
    async function handleCallback() {
      if (!token) {
        toast.error('Authentication failed');
        navigate('/login');
        return;
      }

      try {
        // Fetch user data with the token
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        login(response.data.data.user, token);
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to complete login');
        navigate('/login');
      }
    }

    handleCallback();
  }, [token, login, navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-zinc-400 font-medium animate-pulse uppercase tracking-widest text-xs">
        Finalizing authentication...
      </p>
    </div>
  );
}
破
