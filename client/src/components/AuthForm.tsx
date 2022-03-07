import React, { useState } from 'react';

import {
  Alert, Anchor, Button, Group, ModalProps, TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useModals } from '@mantine/modals';
import {
  IoAt, IoCloseCircle, IoLockClosed, IoPerson,
} from 'react-icons/io5';

import { emailValidator, passwordValidator, usernameValidator } from '@utils/validators';
import axios from '../config/axios';
import ForgotPassword from './ForgotPassword';

export type AuthType = 'login' | 'signup' | 'forgotPassword'

interface AuthFormProps {
  type: AuthType
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const form = useForm({
    initialValues: {
      username: '', // Login only
      email: '', // Login only
      identifier: '', // Signup Only
      password: '', // Common
      confirmPassword: '', // Signup Only
    },

    validationRules: {
      username: (value) => type === 'login' || usernameValidator(value),
      email: (value) => type === 'login' || emailValidator(value),
      identifier: (value) => type === 'signup' || value.trim().length > 0,
      password: (value) => (type === 'login' ? value.trim().length > 0 : passwordValidator(value)),
      confirmPassword: (value, values) => type === 'login' || value === values?.password,
    },

    errorMessages: {
      username: 'username must be 3-16 characters',
      email: 'email must be valid',
      identifier: 'username or email cannot be blank',
      password: type === 'login' ? 'password cannot be blank' : 'password must be at least 8 characters',
      confirmPassword: 'Passwords don\'t match',
    },
  });

  const modals = useModals();

  const openModal = (authType: AuthType) => {
    if (authType !== 'forgotPassword') modals.closeAll();
    form.reset();
    modals.openModal(AuthModals[authType]);
  };

  const handleSubmit = async (values: typeof form['values']) => {
    setLoading(true);

    try {
      await axios.post(`/users/${type}`, { ...values });
    } catch (err: any) {
      const resError = err?.response?.data?.error;
      if (!resError) {
        setFailed(true);
      } else {
        const { fieldErrors } = resError;
        fieldErrors.forEach((fieldError: {field: keyof typeof form['values'], message: string}) => {
          const { field, message } = fieldError;
          const formFieldName = (field === 'username' || field === 'email') && type === 'login' ? 'identifier' : field;

          form.setFieldError(formFieldName, `${field} ${message}`);
        });
      }
    }

    setLoading(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group direction="column" align="stretch">
        { type === 'signup' ? (
          <>
            <TextInput
              icon={<IoPerson />}
              label="Username"
              placeholder="Your username"
              required
              onBlur={() => form.validateField('username')}
              {...form.getInputProps('username')}
            />
            <TextInput
              icon={<IoAt />}
              label="Email Address"
              placeholder="Your email address"
              required
              onBlur={() => form.validateField('email')}
              {...form.getInputProps('email')}
            />
          </>
        ) : (
          <TextInput
            icon={<IoPerson />}
            label="Username or Email"
            placeholder="Your username or email"
            required
            onBlur={() => form.validateField('identifier')}
            {...form.getInputProps('identifier')}
          />

        )}
        <TextInput
          icon={<IoLockClosed />}
          label="Password"
          placeholder="Password"
          onBlur={() => form.validateField('password')}
          type="password"
          required
          {...form.getInputProps('password')}
        />
        { type === 'signup' && (
          <TextInput
            icon={<IoLockClosed />}
            label="Confirm Password"
            placeholder="Confirm Password"
            onBlur={() => form.validateField('confirmPassword')}
            type="password"
            required
            {...form.getInputProps('confirmPassword')}
          />
        )}
        {type === 'login' && (
          <Anchor size="sm" color="gray" onClick={() => openModal('forgotPassword')}>
            Forgot your Password?
          </Anchor>
        )}
        <Group position="apart" spacing="xs">
          { type === 'login' ? (
            <Anchor size="sm" color="gray" onClick={() => openModal('signup')}>
              No account? Signup
            </Anchor>
          ) : (
            <Anchor size="sm" color="gray" onClick={() => openModal('login')}>
              Have an account? Login
            </Anchor>
          )}
          <Button type="submit" loading={loading}>
            { type === 'login' ? 'Login' : 'Signup' }
          </Button>
        </Group>
        { failed && (
        <Alert
          color="red"
          icon={<IoCloseCircle />}
          title="Something went wrong!"
          withCloseButton
          onClose={() => setFailed(false)}
        >
          Something went wrong
        </Alert>
        )}
      </Group>
    </form>
  );
};

export const AuthModals: {[type in AuthType]: Partial<Omit<ModalProps, 'opened'>>} = {
  login: {
    title: 'Login to TypeTrial',
    size: 400,
    children: <AuthForm type="login" />,
  },
  signup: {
    title: 'Signup for TypeTrial',
    size: 400,
    children: <AuthForm type="signup" />,
  },
  forgotPassword: {
    title: 'Reset your TypeTrial password',
    size: 400,
    children: <ForgotPassword />,
  },
};

export default AuthForm;
