'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [charityName, setCharityName] = useState('');
  const [charityDesc, setCharityDesc] = useState('');
  const [latestDraw, setLatestDraw] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    document.title = 'Admin Panel';
    }, []);

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

    if (data) calculateResults(data.numbers);
  };

  const addCharity = async () => {
    if (!charityName) return alert('Enter charity name');

    await supabase.from('charities').insert([
      { name: charityName, description: charityDesc },
    ]);

    alert('Charity added!');
    setCharityName('');
    setCharityDesc('');
  };

  // 🎯 CALCULATE MATCHES
  const calculateResults = async (drawNumbers) => {
    const { data: scores } = await supabase.from('scores').select('*');

    const grouped = {};

    scores.forEach((s) => {
      if (!grouped[s.user_id]) grouped[s.user_id] = [];
      grouped[s.user_id].push(s.score);
    });

    const resultsArray = [];

    Object.keys(grouped).forEach((userId) => {
      const userScores = grouped[userId];

      let matchCount = 0;

      drawNumbers.forEach((num) => {
        if (userScores.includes(num)) matchCount++;
      });

      resultsArray.push({
        userId,
        matchCount,
      });
    });

    setResults(resultsArray);
  };

  const generateDraw = async () => {
    const numbers = [];

    while (numbers.length < 5) {
      const rand = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(rand)) numbers.push(rand);
    }

    await supabase.from('draws').insert([{ numbers }]);

    setLatestDraw({ numbers });

    // 🔥 calculate results immediately
    calculateResults(numbers);
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

        {/* RESULTS */}
        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg mb-2">Results</h3>

            {results.map((r, i) => {
              const userEmail =
                users.find((u) => u.id === r.userId)?.email || r.userId;

              return (
                <div
                  key={i}
                  className="bg-gray-900 p-3 mb-2 rounded border border-gray-700"
                >
                  {userEmail} | Matches: {r.matchCount}

                  {r.matchCount === 3 && (
                    <span className="text-green-400"> 🎉 Small Win</span>
                  )}
                  {r.matchCount === 4 && (
                    <span className="text-yellow-400"> 🔥 Big Win</span>
                  )}
                  {r.matchCount === 5 && (
                    <span className="text-pink-400"> 💰 JACKPOT</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD CHARITY */}
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
            className="bg-gray-900 p-3 mb-2 rounded border border-gray-700"
          >
            {u.email} | {u.contribution_percent}%
          </div>
        ))}
      </div>
    </div>
  );
}