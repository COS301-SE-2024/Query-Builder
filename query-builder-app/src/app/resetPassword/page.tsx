'use client'
import { useState } from 'react';
import { createClient } from './../../utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handlePasswordReset = async () => {
    if (password === confirmPassword) {
      setError(''); // Clear error
      // Call the password reset function here
      const success = await sendResetPassword();
      if (success) {
        alert('Password has been reset successfully!');
        router.push('/signedInHome'); // Redirect user after successful reset
      }
    } else {
      setError('Passwords do not match');
    }
  };

  const sendResetPassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error(error);
      setError('An unexpected error occurred.');
      return false;
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <div className="container mx-auto w-[400px] grid gap-4">
        <div className="grid">
          <label>Enter your password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid">
          <label>Confirm your password:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <div className="text-sm">
          <input
            type="checkbox"
            name="showPassword"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <label>Show password</label>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button onClick={handlePasswordReset}>Reset Password</button>
      </div>
    </div>
  );
}
