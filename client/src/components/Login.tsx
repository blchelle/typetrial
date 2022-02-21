import React, { useContext, useState } from 'react';

import Button from '@components/Button';
import TextInput from '@components/TextInput';
import axios from '@config/axios';
import _ from 'lodash';
import { blankValidator } from '@utils/validators';
import { AuthViewContext } from './AuthMux';
import { FieldError, ApiError } from '../types/api';

export type SignupError = {
  identifier?: FieldError,
  password?: FieldError,
}

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<SignupError>({});

  const { changeView } = useContext(AuthViewContext);

  const inputIsValid = () => blankValidator(identifier) && blankValidator(password);

  const sendRequest = async () => {
    const params = new URLSearchParams();
    params.append('identifier', identifier);
    params.append('password', password);
    await axios.post('/api/users/login', params)
      .then((res) => {
        alert('Login successful!');
        // TODO: CLOSE MODAL
      })
      .catch((err) => {
        if (err.response) {
          const apiError: ApiError = err.response.data.error;
          if (apiError.fieldErrors.length > 0) {
            console.log(_(apiError.fieldErrors)
              .keyBy(((x:FieldError) => x.field))
              .mapKeys((value, key) => {
                if (key === 'username' || key === 'email' || key === 'email/username') {
                  return 'identifier';
                }
                return key;
              })
              .value());
            setErrors(_(apiError.fieldErrors)
              .keyBy(((x:FieldError) => x.field))
              .mapKeys((value, key) => {
                if (key === 'username' || key === 'email' || key === 'email/username') {
                  return 'identifier';
                }
                return key;
              })
              .value());
          }
        }
        // TODO: STOP BUTTON SPINNING
      });
  };

  return (
    <div className="grid gap-4 p-8">
      <h3 className="text-2xl mb-4">Login to your account</h3>
      <TextInput
        label="Username or Email"
        name="username"
        onChange={(newIdentifier) => setIdentifier(newIdentifier)}
        isValid={blankValidator(identifier)}
        errorNote={errors.identifier ? `${errors.identifier.field} ${errors.identifier.message}` : ''}
      />
      <TextInput
        label="Password"
        name="password"
        onChange={(newPassword) => setPassword(newPassword)}
        isValid={blankValidator(password)}
        errorNote={errors.password ? `${errors.password.field} ${errors.password.message}` : ''}
        type="password"
      />
      <div className="grid gap-2 grid-cols-2 mt-4">
        <Button
          text="Login"
          fullWidth
          isAsync
          onClick={sendRequest}
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
