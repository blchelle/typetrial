import {
  Button, Group, Paper, TextInput, Title,
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { passwordValidator } from '@utils/validators';
import axios from 'axios';
import React from 'react';
import { IoLockClosed } from 'react-icons/io5';
import { useParams } from 'react-router';

const ResetPassword: React.FC = () => {
  const { token } = useParams();

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    errorMessages: {
      password: 'password is too weak',
      confirmPassword: 'passwords do not match',
    },
    validationRules: {
      password: (value) => passwordValidator(value),
      confirmPassword: (value, values) => value === values?.confirmPassword,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.post('/users/password-reset', { token, password: values.password });
    } catch (err) {
      // TODO
    }
  };

  return (
    <Paper shadow="lg" padding="lg">
      <Title order={4}>Reset your Password</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group direction="column">
          <TextInput
            icon={<IoLockClosed />}
            label="Password"
            placeholder="Password"
            onBlur={() => form.validateField('password')}
            type="password"
            required
            {...form.getInputProps('password')}
          />
          <TextInput
            icon={<IoLockClosed />}
            label="Confirm Password"
            placeholder="Confirm Password"
            onBlur={() => form.validateField('confirmPassword')}
            type="password"
            required
            {...form.getInputProps('confirmPassword')}
          />
          <Button type="submit">Reset Password</Button>
        </Group>
      </form>
    </Paper>
  );
};

export default ResetPassword;
