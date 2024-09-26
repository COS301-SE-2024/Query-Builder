import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <span className="close-icon" onClick={onClose}>&times;</span>
        <h2>Reset Password</h2>
        <p>Enter your email address to receive a password reset link.</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="reset-button" onClick={() => onSubmit(email)}>Send Reset Link</button>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          padding: 20px;
          border-radius: 8px;
          max-width: 400px;
          width: 100%;
          position: relative;
        }
        .close-icon {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 24px;
          color: #4e56b1;
          cursor: pointer;
        }
        h2 {
          text-align: center;
        }
        input {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .reset-button {
          width: 100%;
          padding: 10px;
          background-color: #4e56b1;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        }
        .reset-button:hover {
          background-color: #3c4a8f; /* Darker shade on hover */
        }
      `}</style>
    </div>
  );
};

// Export the component
export default ForgotPasswordModal;
