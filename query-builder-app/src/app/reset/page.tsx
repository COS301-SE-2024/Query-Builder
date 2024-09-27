'use client';
import { useState } from 'react';
import { createClient } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@nextui-org/react';
import { Toaster, toast } from 'react-hot-toast';

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
      const success = await sendResetPassword();
      if (success) {
        toast.success('Password has been reset successfully!');
        router.push('/'); // Redirect user after successful reset
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
    <div className="bg-gray-800 bg-opacity-50 h-screen flex items-center justify-center">
      <Toaster/>
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-[400px]">
        <div className="flex justify-center">
          <h1 className="text-4xl font-bold text-gray-900">Reset Password</h1>
        </div>
        <div className="grid gap-4 mt-6">
          <div className="grid">
            <label className="text-gray-700">Enter a new password:</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded-lg "
            />
          </div>
          <div className="grid">
            <label className="text-gray-700">Confirm your new password:</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 rounded-lg"
            />
          </div>
          <div className="flex items-center text-sm mt-2">
            <input
              type="checkbox"
              name="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="mr-2"
            />
            <label className="text-gray-600">Show password</label>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <Button 
            color='primary'
            onClick={handlePasswordReset}
            className="w-full mt-4"
          >
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
}
