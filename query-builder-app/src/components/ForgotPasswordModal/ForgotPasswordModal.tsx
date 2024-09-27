import { Button, Input } from '@nextui-org/react';
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
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Centering the button */}
        <div className="button-container">
          <Button className="reset-button" color="primary" onClick={() => onSubmit(email)}>
            Send Reset Link
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5); /* Add transparency to the background */
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          background-color: white;
          padding: 20px 30px;
          border-radius: 8px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
          text-align: center;
        }

        .close-icon {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 24px;
          cursor: pointer;
        }

        h2 {
          margin-top: 0;
          font-size: 24px;
          color: #333;
        }

        p {
          margin: 10px 0 20px 0;
          font-size: 16px;
          color: #555;
        }

        .input {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .button-container {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }

        .reset-button {
          width: 100%;
          padding: 10px 20px;
          background-color: #007bff;
          border: none;
          color: white;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        }

        .reset-button:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

// Export the component
export default ForgotPasswordModal;
