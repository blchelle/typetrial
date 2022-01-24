import React from 'react';
import Button from '@components/Button';

const ButtonsShowcase: React.FC = () => (
  <>
    <h1 className="text-3xl mb-4">Buttons Showcase</h1>
    <div className="bg-gray-200 grid grid-cols-4 p-16 gap-4 border-4 border-gray-300 rounded-lg items-center">
      <p className="font-bold" />
      <p className="font-bold">Primary</p>
      <p className="font-bold">Secondary</p>
      <p className="font-bold">Ghost</p>
      <p className="font-bold">Small</p>
      <Button text="Button Text" size="small" onClick={() => {}} />
      <Button text="Button Text" size="small" color="secondary" onClick={() => {}} />
      <Button text="Button Text" size="small" type="ghost" onClick={() => {}} />
      <p className="font-bold">Medium</p>
      <Button text="Button Text" size="medium" onClick={() => {}} />
      <Button text="Button Text" size="medium" color="secondary" onClick={() => {}} />
      <Button text="Button Text" size="medium" type="ghost" onClick={() => {}} />
      <p className="font-bold">Large</p>
      <Button text="Button Text" size="large" onClick={() => {}} />
      <Button text="Button Text" size="large" color="secondary" onClick={() => {}} />
      <Button text="Button Text" size="large" type="ghost" onClick={() => {}} />
      <p className="font-bold">Fit</p>
      <Button text="Button Text" size="fit" onClick={() => {}} />
      <Button text="Button Text" size="fit" color="secondary" onClick={() => {}} />
      <Button text="Button Text" size="fit" type="ghost" onClick={() => {}} />
      <p className="font-bold">Outlined</p>
      <Button text="Button Text" size="fit" type="border" onClick={() => {}} />
      <Button text="Button Text" size="fit" color="secondary" type="border" onClick={() => {}} />
    </div>
  </>
);

export default ButtonsShowcase;
