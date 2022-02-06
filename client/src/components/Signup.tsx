import React, { useContext, useState } from 'react';

import { blankValidator, emailValidator, passwordValidator } from '@utils/validators';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import { AuthViewContext } from './AuthMux';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');

  const { changeView } = useContext(AuthViewContext);

  const inputIsValid = () => emailValidator(email)
      && blankValidator(username)
      && passwordValidator(password)
      && password === confirmedPassword;

  return (
    <div className="grid gap-4 p-8">
      <h3 className="text-2xl">Signup for Type Trial</h3>
      <TextInput label="Email Address" name="email" onChange={(newEmail) => setEmail(newEmail)} isValid={emailValidator(email)} />
      <TextInput label="Username" name="username" onChange={(newUsername) => setUsername(newUsername)} isValid={blankValidator(username)} />
      <TextInput
        isValid={passwordValidator(password)}
        label="Password"
        name="password"
        note="8+ uppercase, lowercase, number"
        onChange={(newPassword) => setPassword(newPassword)}
        type="password"
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
          onClick={(callback) => setTimeout(callback!, 3000)}
          isDisabled={!inputIsValid()}
        />
        <Button text="Login" fullWidth color="secondary" type="border" onClick={() => changeView('login')} />
      </div>
    </div>
  );
};

export default Signup;
