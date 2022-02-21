import React, { useContext, useState } from 'react';

import { blankValidator, emailValidator, passwordValidator } from '@utils/validators';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import axios from '@config/axios';
import _ from 'lodash';
import { AuthViewContext } from './AuthMux';

import { FieldError, ApiError } from '../types/api';

export type SignupError = {
  username?: FieldError,
  password?: FieldError,
  email?: FieldError
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  const [errors, setErrors] = useState<SignupError>({});

  const { changeView } = useContext(AuthViewContext);

  const inputIsValid = () => emailValidator(email)
      && blankValidator(username)
      && passwordValidator(password)
      && password === confirmedPassword;

  const sendRequest = async () => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('email', email);
    params.append('password', password);
    await axios.post('/api/users/signup', params)
      .then((res) => {
        // TODO: CLOSE MODAL
      })
      .catch((err) => {
        if (err.response) {
          const apiError: ApiError = err.response.data.error;
          if (apiError.fieldErrors.length > 0) {
            setErrors(_.keyBy(apiError.fieldErrors, ((x:FieldError) => x.field)));
          }
        }
        // TODO: STOP BUTTON SPINNING
      });
  };

  return (
    <div className="grid gap-4 p-8">
      <h3 className="text-2xl">Signup for Type Trial</h3>
      <TextInput
        label="Email Address"
        name="email"
        onChange={(newEmail) => setEmail(newEmail)}
        isValid={emailValidator(email) && !errors.email}
        errorNote={errors.email ? `${errors.email.field} ${errors.email.message}` : ''}
      />
      <TextInput
        label="Username"
        name="username"
        onChange={(newUsername) => setUsername(newUsername)}
        isValid={blankValidator(username) && !errors.username}
        errorNote={errors.username ? `${errors.username.field} ${errors.username.message}` : ''}
      />
      <TextInput
        label="Password"
        name="password"
        note="8+ uppercase, lowercase, number"
        onChange={(newPassword) => setPassword(newPassword)}
        isValid={passwordValidator(password) && !errors.password}
        type="password"
        errorNote={errors.password ? `${errors.password.field} ${errors.password.message}` : ''}
      />
      <TextInput
        isValid={passwordValidator(password) && password === confirmedPassword}
        label="Confirm Password"
        name="confirm-password"
        onChange={(newConfirmedPassword) => setConfirmedPassword(newConfirmedPassword)}
        type="password"
      />
      <div className="grid gap-2 grid-cols-2 mt-4">
        <Button
          text="Signup"
          fullWidth
          isAsync
          onClick={sendRequest}
          isDisabled={!inputIsValid()}
        />
        <Button text="Login" fullWidth color="secondary" type="border" onClick={() => changeView('login')} />
      </div>
    </div>
  );
};

export default Signup;
