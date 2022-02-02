import React from 'react';
import { IoCheckmarkCircle } from 'react-icons/io5';

import Button from '@components/Button';

const simulateLoad = (callback?: () => void) => setTimeout(callback!, 3000);

const ButtonsShowcase: React.FC = () => (
  <>
    <h1 className="text-3xl">Buttons Showcase</h1>
    <h3 className="text-md text-gray-500">Click buttons to see loading animation</h3>
    <div className="bg-gray-100 grid grid-cols-3 p-16 gap-4 border-4 border-gray-200 rounded-lg items-center">
      <p className="font-bold" />
      <p className="font-bold">Primary</p>
      <p className="font-bold">Secondary</p>

      <p className="font-bold">Solid</p>
      <Button text="Button Text" onClick={simulateLoad} isAsync />
      <Button text="Button Text" color="secondary" onClick={simulateLoad} isAsync />

      <p className="font-bold">Solid Disabled</p>
      <Button text="Button Text" onClick={simulateLoad} isDisabled />
      <Button text="Button Text" color="secondary" onClick={simulateLoad} isDisabled />

      <p className="font-bold">Border</p>
      <Button text="Button Text" type="border" onClick={simulateLoad} isAsync />
      <Button text="Button Text" type="border" color="secondary" onClick={simulateLoad} isAsync />

      <p className="font-bold">Border Disabled</p>
      <Button text="Button Text" type="border" onClick={simulateLoad} isDisabled />
      <Button text="Button Text" color="secondary" type="border" onClick={simulateLoad} isDisabled />

      <p className="font-bold">Ghosts</p>
      <Button text="Button Text" type="ghost" onClick={simulateLoad} isAsync />
      <Button text="Button Text" color="secondary" type="ghost" onClick={simulateLoad} isAsync />

      <p className="font-bold">Ghosts Disabled</p>
      <Button text="Button Text" type="ghost" onClick={simulateLoad} isDisabled />
      <Button text="Button Text" color="secondary" type="ghost" onClick={simulateLoad} isDisabled />

      <p className="font-bold">With Icon</p>
      <Button text="Button Text" onClick={simulateLoad} isAsync Icon={IoCheckmarkCircle} />
      <Button text="Button Text" color="secondary" onClick={simulateLoad} isAsync Icon={IoCheckmarkCircle} />

      <p className="font-bold">With Icon Disabled</p>
      <Button text="Button Text" onClick={simulateLoad} isDisabled Icon={IoCheckmarkCircle} />
      <Button text="Button Text" color="secondary" onClick={simulateLoad} isDisabled Icon={IoCheckmarkCircle} />
    </div>
  </>
);

export default ButtonsShowcase;
