import React, { useContext, useState } from 'react';

import { AuthViewContext } from '@components/AuthMux';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import { blankValidator } from '@utils/validators';

const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');

  const { changeView } = useContext(AuthViewContext);

  const inputIsValid = () => blankValidator(identifier);

  return (
    <div className="grid gap-4 p-8">
      <h3 className="text-2xl mb-4">Reset your password</h3>
      <TextInput label="Username or Email" name="username" onChange={(newIdentifier) => setIdentifier(newIdentifier)} isValid={blankValidator(identifier)} />
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button
          fullWidth
          isAsync
          isDisabled={!inputIsValid()}
          onClick={(callback) => setTimeout(callback!, 3000)}
          text="Send Email"
        />
        <Button
          color="secondary"
          fullWidth
          onClick={() => changeView('login')}
          text="Back"
          type="border"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
