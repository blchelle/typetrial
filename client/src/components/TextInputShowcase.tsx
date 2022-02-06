import React from 'react';
import TextInput from './TextInput';

const TextInputShowcase: React.FC = () => (
  <>
    <h1 className="text-3xl mb-4">Input Showcase</h1>
    <div className="bg-white grid grid-cols-3 p-16 gap-8 border-4 border-gray-300 rounded-lg items-center">
      <div />
      <p className="font-bold">Email Address</p>
      <p className="font-bold">Username</p>
      <p className="font-bold">Primary</p>
      <TextInput label="Email Address" name="email" onChange={() => {}} />
      <TextInput label="Username" name="username" onChange={() => {}} />
      <p className="font-bold">Secondary</p>
      <TextInput label="Email Address" name="email2" color="secondary" onChange={() => {}} />
      <TextInput label="Username" name="username2" color="secondary" onChange={() => {}} />
    </div>
  </>
);

export default TextInputShowcase;
