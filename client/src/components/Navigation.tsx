import React, { useState } from 'react';
import Button from '@components/Button';
import AuthMux, { AuthView } from '@components/AuthMux';
import Modal from './Modal';

const Navigation: React.FC = () => {
  const [openModal, setOpenModal] = useState<AuthView | null>(null);

  return (
    <div className="h-14 w-full bg-gray-200 flex px-12 fixed">
      <div className="ml-auto flex p-2">
        <Button text="Login" type="ghost" style={{ marginRight: '0.5rem' }} onClick={() => setOpenModal('login')} />
        <Button text="Sign Up" onClick={() => setOpenModal('signup')} />
        { openModal && (
          <Modal
            isOpen
            onRequestClose={() => setOpenModal(null)}
          >
            <AuthMux defaultView={openModal} />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Navigation;
