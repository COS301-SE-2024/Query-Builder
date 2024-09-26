'use client';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js'; // Ensure you have this import

const supabaseUrl = 'https://your-supabase-url.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'your-anon-key'; // Replace with your Supabase Anon Key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Handle password reset logic here
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError('Error updating password: ' + updateError.message);
    } else {
      setSuccess(true);
      alert('Password reset successfully!'); // Placeholder for actual success handling
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#f9f9f9' 
    }}>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: '',
          duration: 5000,
          style: {
            color: '#000',
            background: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      
      <form onSubmit={handleSubmit} style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' 
      }}>
        <h2>Reset Your Password</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Password reset successfully!</p>}
        <div>
          <label>
            New Password:
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', margin: '8px 0' }} 
            />
          </label>
        </div>
        <div>
          <label>
            Confirm Password:
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', margin: '8px 0' }} 
            />
          </label>
        </div>
        <button type="submit" style={{ 
          background: '#007BFF', 
          color: '#fff', 
          padding: '10px 15px', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer' 
        }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
