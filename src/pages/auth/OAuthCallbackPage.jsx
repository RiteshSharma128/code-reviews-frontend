import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const success = params.get('success');
    const error = params.get('error');
    if (error) { toast.error('OAuth login failed'); navigate('/login'); return; }
    if (success) {
      checkAuth().then(() => { toast.success('Logged in successfully! 🎉'); navigate('/dashboard'); });
    }
  }, []);

  return <LoadingSpinner fullScreen />;
}
