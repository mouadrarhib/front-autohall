// src/hooks/useActivityTracker.ts
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useActivityTracker = () => {
  const updateLastActivity = useAuthStore((state) => state.updateLastActivity);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      updateLastActivity();
    };

    // Track user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateLastActivity]);
};
