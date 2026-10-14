import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAdminError() {
  const navigate = useNavigate();
  return useCallback(
    (err, setError) => {
      if (err.status === 401) navigate('/admin/login');
      else setError(err.message);
    },
    [navigate]
  );
}
