import React from 'react';

import {
  Button, Group, TextInput,
} from '@mantine/core';
import { blankValidator } from '@utils/validators';
import { useForm } from '@mantine/hooks';
import { IoCheckmark, IoClose, IoPerson } from 'react-icons/io5';
import { useNotifications } from '@mantine/notifications';
import axios from '../config/axios';

const ForgotPassword: React.FC = () => {
  const form = useForm({
    initialValues: { identifier: '' },
    validationRules: { identifier: (value) => blankValidator(value) },
    errorMessages: { identifier: 'identifier must be valid' },
  });

  const notifications = useNotifications();

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await axios.post('/users/password-reset-email', { ...values });

      notifications.showNotification({
        title: 'Email Sent!',
        color: 'green',
        icon: <IoCheckmark />,
        message: 'You should see the email in your inbox shortly',
      });
    } catch (err: any) {
      const resError = err?.response?.data?.error;
      if (!resError) {
        notifications.showNotification({
          title: 'Uh Oh!',
          color: 'red',
          icon: <IoClose />,
          message: 'Something went wrong here...',
        });
      } else {
        const { fieldErrors } = resError;
        fieldErrors.forEach((fieldError: {field: typeof form.values, message: string}) => {
          const { field, message } = fieldError;
          form.setFieldError('identifier', `${field} ${message}`);
        });
      }
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
