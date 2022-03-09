import React from 'react';

import {
  Button, Group, TextInput,
} from '@mantine/core';
import { blankValidator } from '@utils/validators';
import { useForm } from '@mantine/hooks';
import { IoPerson } from 'react-icons/io5';
import axios from '../config/axios';

const ForgotPassword: React.FC = () => {
  const form = useForm({
    initialValues: { identifier: '' },
    validationRules: { identifier: (value) => blankValidator(value) },
    errorMessages: { identifier: 'identifier must be valid' },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.post('/users/password-reset-email', { ...values });
    } catch (err) {
      // TODO
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group direction="column" align="stretch">
        <TextInput
          label="Username or Email Address"
          required
          icon={<IoPerson />}
          placeholder="Your username or email"
          {...form.getInputProps('identifier')}
        />
        <Group position="apart">
          <div />
          <Button type="submit">Send Email</Button>
        </Group>
      </Group>
    </form>
  );
};

export default ForgotPassword;
