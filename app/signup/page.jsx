'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const router = useRouter();

  useEffect(() => {
    document.title = 'Signup';
    }, []);

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) alert(error.message);
    else alert('Signup successful!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="bg-gray-800/60 backdrop-blur p-8 rounded-2xl w-80 shadow-lg">
        <h1 className="text-2xl mb-6 font-bold text-center">Signup</h1>

        <input
          className="p-2 mb-3 w-full rounded bg-gray-900 border border-gray-700"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            className="p-2 mb-3 w-full rounded bg-gray-900 border border-gray-700"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-2 cursor-pointer"
          >
            👁
          </span>
        </div>

        <button
          className="bg-green-500 w-full py-2 rounded mt-2"
          onClick={handleSignup}
        >
          Signup
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-purple-400 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}