import React, { useEffect, useMemo, useState } from 'react';

import Signup from '@components/Signup';
import Login from '@components/Login';
import ForgotPassword from '@components/ForgotPassword';

export type AuthView = 'signup' | 'login' | 'reset password'
interface AuthMuxProps {
    defaultView: AuthView;
}

export const AuthViewContext = React.createContext({ view: 'signup', changeView: (_: AuthView) => {} });

const AuthMux: React.FC<AuthMuxProps> = ({ defaultView }) => {
  const [mode, setMode] = useState<AuthView>('signup');
  useEffect(() => {
    setMode(defaultView);
  }, [defaultView]);

  const authView = () => {
    if (mode === 'signup') return <Signup />;
    if (mode === 'login') return <Login />;
    if (mode === 'reset password') return <ForgotPassword />;

    return null;
  };

  const providerValue = useMemo(() => ({ view: mode, changeView: setMode }), []);
  return (
    <AuthViewContext.Provider value={providerValue}>
      { authView() }
    </AuthViewContext.Provider>
  );
};

export default AuthMux;
