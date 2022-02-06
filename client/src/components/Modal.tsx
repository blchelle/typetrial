import React from 'react';
import { IoClose } from 'react-icons/io5';
import ReactModal from 'react-modal';

const Modal: React.FC<ReactModal.Props> = ({ children, isOpen, onRequestClose }) => (
  <ReactModal
    isOpen={isOpen}
    style={{
      overlay: {
        backgroundColor: '#00000044',
        zIndex: '100',
      },
      content: {
        width: 'max-content',
        height: 'max-content',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '0',
        borderWidth: '0',
        boxShadow: '4px 6px 10px #00000044',
        zIndex: '1000',
      },
    }}
    onRequestClose={onRequestClose}
    shouldCloseOnEsc={false}
  >
    <div className="w-full h-4 bg-primary" />
    <div className="relative">
      <button
        className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
        onClick={onRequestClose}
      >
        <IoClose className="w-6 h-6 text-gray-500" />
      </button>
      {children}
    </div>
  </ReactModal>
);

export default Modal;
