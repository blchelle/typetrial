import React, { useContext, useState } from 'react';

import Button from '@components/Button';
import TextInput from '@components/TextInput';
import { blankValidator, passwordValidator } from '@utils/validators';
import { AuthViewContext } from './AuthMux';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const { changeView } = useContext(AuthViewContext);

  const inputIsValid = () => blankValidator(identifier) && blankValidator(password);

  return (
    <div className="grid gap-4 p-8">
      <h3 className="text-2xl mb-4">Login to your account</h3>
      <TextInput
        label="Username or Email"
        name="username"
        onChange={(newIdentifier) => setIdentifier(newIdentifier)}
        isValid={blankValidator(identifier)}
      />
      <TextInput
        label="Password"
        name="password"
        onChange={(newPassword) => setPassword(newPassword)}
        isValid={blankValidator(password)}
        type="password"
      />
      <div className="grid gap-2 grid-cols-2 mt-4">
        <Button
          text="Login"
          fullWidth
          isAsync
          onClick={(callback) => setTimeout(callback!, 3000)}
          isDisabled={!inputIsValid()}
        />
        <Button
          color="secondary"
          fullWidth
          onClick={() => changeView('signup')}
          text="Signup"
          type="border"
        />
      </div>
      <button
        className="text-sm font-bold text-secondary hover:text-secondary-dark cursor-pointer mt-4"
        onClick={() => changeView('reset password')}
      >
        Forgot Password?
      </button>
    </div>
  );
};

export default Login;
