// src/hooks/useSessionTimeout.ts
import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const SESSION_WARNING_TIME = 25 * 60 * 1000; // 25 minutes - warn before expiry
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes - force logout

export const useSessionTimeout = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastActivity = useAuthStore((state) => state.lastActivity);
  const logout = useAuthStore((state) => state.logout);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !lastActivity) return;

    const checkSession = setInterval(async () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      // Show warning at 25 minutes
      if (inactiveTime >= SESSION_WARNING_TIME && !warningShownRef.current) {
        warningShownRef.current = true;
        
        try {
          const { toast } = await import('react-toastify');
          toast.warning('Your session will expire soon due to inactivity.', {
            position: 'top-center',
            autoClose: 10000,
          });
        } catch (e) {
          console.warn('Session will expire soon');
        }
      }

      // Force logout at 30 minutes
      if (inactiveTime >= SESSION_TIMEOUT) {
        console.log('Session timed out due to inactivity');
        
        try {
          const { toast } = await import('react-toastify');
          toast.error('Session expired due to inactivity. Please login again.', {
            position: 'top-center',
            autoClose: 5000,
          });
        } catch (e) {
          console.warn('Session expired');
        }

        await logout();
        navigate('/login');
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSession);
  }, [isAuthenticated, lastActivity, logout, navigate]);
};
