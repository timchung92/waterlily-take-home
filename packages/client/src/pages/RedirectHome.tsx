import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function RedirectHome() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  },
    [
      navigate
    ]
  );

  return null;
}
