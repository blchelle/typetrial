import React, { useState } from 'react';

import {
  Button, Group, TextInput,
} from '@mantine/core';
import { emailValidator } from '@utils/validators';
import { useForm } from '@mantine/hooks';
import { IoAt } from 'react-icons/io5';

const ForgotPassword: React.FC = () => {
  const form = useForm({
    initialValues: { email: '' },
    validationRules: { email: (value) => emailValidator(value) },
    errorMessages: { email: 'email must be a valid' },
  });

  return (
    <form onSubmit={form.onSubmit(() => {})}>
      <Group direction="column" align="stretch">
        <TextInput label="Email Address" placeholder="Your email address" icon={<IoAt />} {...form.getInputProps('email')} required />
        <Group position="apart">
          <div />
          <Button>Send Email</Button>
        </Group>

      </Group>
    </form>
  );
};

export default ForgotPassword;
