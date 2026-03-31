'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [score, setScore] = useState('');
  const [scores, setScores] = useState([]);

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState('');
  const [percent, setPercent] = useState(10);

  const [latestDraw, setLatestDraw] = useState(null);

  useEffect(() => {
    getUser();
    fetchCharities();
    fetchLatestDraw();
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) fetchScores(data.user.id);
  };

  const fetchScores = async (userId) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false });

    setScores(data || []);
  };

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*');
    setCharities(data || []);
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

  const addScore = async () => {
    if (!score || score < 1 || score > 45) {
      alert('Enter valid score (1–45)');
      return;
    }

    const { data: existing } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('played_at', { ascending: true });

    if (existing.length >= 5) {
      await supabase
        .from('scores')
        .delete()
        .eq('id', existing[0].id);
    }

    await supabase.from('scores').insert([
      {
        user_id: user.id,
        score: Number(score),
        played_at: new Date(),
      },
    ]);

    setScore('');
    fetchScores(user.id);
  };

  const saveCharity = async () => {
    if (!selectedCharity) {
      alert('Select charity');
      return;
    }

    await supabase.from('users').upsert([
      {
        id: user.id,
        email: user.email,
        charity_id: selectedCharity,
        contribution_percent: Number(percent),
      },
    ]);

    alert('Saved!');
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

  const checkMatches = (drawNumbers, userScores) => {
    const scoreValues = userScores.map((s) => s.score);

    let matchCount = 0;
    drawNumbers.forEach((num) => {
      if (scoreValues.includes(num)) matchCount++;
    });

    return matchCount;
  };

  const matchCount =
    latestDraw && scores.length > 0
      ? checkMatches(latestDraw.numbers, scores)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-10">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Dashboard
        </h1>



        <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-600 transition"
        >
            👤 Profile
        </button>
        </div>

      {user && (
        <p className="mb-6 text-gray-300">Welcome: {user.email}</p>
      )}
        <h2>Winnings</h2>
        <p>Total Won: ₹0</p>
        <p>Status: Pending</p>

      {/* SCORE INPUT */}
      <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">Add Score</h2>

        <div className="flex gap-3">
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="1–45"
            className="p-2 rounded bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <button
            onClick={addScore}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded hover:opacity-90 transition"
          >
            Add Score
          </button>
        </div>
      </div>

      {/* SCORES LIST */}
      <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">Your Scores</h2>

        {scores.map((s) => (
          <div
            key={s.id}
            className="bg-gray-900 p-3 mb-2 rounded flex justify-between hover:bg-gray-700 transition"
          >
            <span>Score: {s.score}</span>
            <span>{new Date(s.played_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      {/* CHARITY */}
      <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">Support Charity ❤️ (in %)</h2>

        <select
          className="p-2 rounded bg-gray-900 border border-gray-700 mb-3 w-full"
          onChange={(e) => setSelectedCharity(e.target.value)}
        >
          <option value="">Select Charity</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={percent}
          min={10}
          max={100}
          onChange={(e) => setPercent(e.target.value)}
          className="p-2 rounded bg-gray-900 border border-gray-700 mb-3 w-full"
        />

        <button
          onClick={saveCharity}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Save Preference
        </button>
      </div>

      {/* DRAW */}
      <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl mb-3 font-semibold">Monthly Draw 🎲</h2>

        <button
          onClick={generateDraw}
          className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded mb-4 hover:opacity-90 transition"
        >
          Generate Draw
        </button>

        {latestDraw && (
          <div className="mb-4">
            <p className="mb-2">Draw Numbers:</p>

            <div className="flex gap-3">
              {latestDraw.numbers.map((num, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-bold shadow"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-lg">Matches: {matchCount}</p>

          {matchCount === 3 && (
            <p className="text-green-400 font-semibold">🎉 Small Win</p>
          )}
          {matchCount === 4 && (
            <p className="text-yellow-400 font-semibold">🔥 Big Win</p>
          )}
          {matchCount === 5 && (
            <p className="text-pink-400 font-bold text-xl">💰 JACKPOT</p>
          )}
        </div>
      </div>
    </div>
  );
}