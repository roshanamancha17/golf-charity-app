'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [charityName, setCharityName] = useState('');
  const [charityDesc, setCharityDesc] = useState('');
  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchLatestDraw();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    setUsers(data || []);
  };

  const fetchLatestDraw = async () => {
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    setLatestDraw(data);
  };

  const addCharity = async () => {
    if (!charityName) return alert('Enter charity name');

    await supabase.from('charities').insert([
      { name: charityName, description: charityDesc },
    ]);

    alert('Added!');
  };

  const generateDraw = async () => {
    const numbers = [];

    while (numbers.length < 5) {
      const rand = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(rand)) numbers.push(rand);
    }

    await supabase.from('draws').insert([{ numbers }]);
    fetchLatestDraw();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-10">
      <h1 className="text-3xl mb-8 font-bold">Admin Panel</h1>

      {/* DRAW */}
      <div className="bg-gray-800/60 p-6 rounded-2xl mb-6">
        <h2 className="text-xl mb-3">Run Draw 🎲</h2>

        <button
          onClick={generateDraw}
          className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded"
        >
          Generate Draw
        </button>

        {latestDraw && (
          <div className="mt-4">
            <p>Latest Draw:</p>
            <div className="flex gap-3 mt-2">
              {latestDraw.numbers.map((n, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CHARITY */}
      <div className="bg-gray-800/60 p-6 rounded-2xl mb-6">
        <h2 className="text-xl mb-3">Add Charity</h2>

        <input
          value={charityName}
          onChange={(e) => setCharityName(e.target.value)}
          placeholder="Name"
          className="p-2 w-full mb-2 rounded bg-gray-900 border border-gray-700"
        />

        <input
          value={charityDesc}
          onChange={(e) => setCharityDesc(e.target.value)}
          placeholder="Description"
          className="p-2 w-full mb-3 rounded bg-gray-900 border border-gray-700"
        />

        <button
          onClick={addCharity}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Add Charity
        </button>
      </div>

      {/* USERS */}
      <div className="bg-gray-800/60 p-6 rounded-2xl">
        <h2 className="text-xl mb-3">Users</h2>

        {users.map((u) => (
          <div
            key={u.id}
            className="bg-gray-900 p-3 mb-2 rounded-lg border border-gray-700"
          >
            {u.email} | {u.contribution_percent}%
          </div>
        ))}
      </div>
    </div>
  );
}