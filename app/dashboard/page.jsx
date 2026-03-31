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
  const [subscription, setSubscription] = useState(null);



  useEffect(() => {
    getUser();
    fetchCharities();
    fetchLatestDraw();
  }, []);

  // 🔐 GET USER + CHECK SUBSCRIPTION
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(data.user);

      const { data: sub } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      setSubscription(sub);

      // 🔥 VALIDATION (expiry check)
      if (sub?.subscription_end) {
        const now = new Date();
        if (new Date(sub.subscription_end) < now) {
          await supabase
            .from('users')
            .update({ subscription_status: 'inactive' })
            .eq('id', data.user.id);

          setSubscription({ ...sub, subscription_status: 'inactive' });
        }
      }

      fetchScores(data.user.id);
    }
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

  // 💳 SUBSCRIPTION ACTIVATION
  const activateSubscription = async (type) => {
    const now = new Date();
    let endDate;

    if (type === 'monthly') {
      endDate = new Date();
      endDate.setMonth(now.getMonth() + 1);
    } else {
      endDate = new Date();
      endDate.setFullYear(now.getFullYear() + 1);
    }

    await supabase.from('users').upsert([
      {
        id: user.id,
        email: user.email,
        plan: type,
        subscription_status: 'active',
        subscription_end: endDate,
      },
    ]);

    alert('Subscription activated!');
    getUser();
  };

  // 🚫 ACCESS CONTROL
  const isSubscribed = subscription?.subscription_status === 'active';

  const addScore = async () => {
    if (!isSubscribed) {
      alert('Please subscribe first');
      return;
    }

    if (!score || score < 1 || score > 45) {
      alert('Enter valid score');
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
    if (!isSubscribed) {
      alert('Subscribe to participate');
      return;
    }

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
    return drawNumbers.filter((n) => scoreValues.includes(n)).length;
  };

  const matchCount =
    latestDraw && scores.length > 0
      ? checkMatches(latestDraw.numbers, scores)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center">
        <div className="w-full max-w-5xl p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
            Dashboard
            </h1>

            <button
            onClick={() => (window.location.href = '/admin')}
            className="bg-gray-700 px-4 py-2 rounded-full hover:bg-gray-600 transition"
            >
            👤 Profile
            </button>
        </div>

        {/* SUBSCRIPTION */}
        <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl mb-3 font-semibold">Subscription</h2>

            <p className="text-gray-300">
            Status: <span className="text-white">{subscription?.subscription_status || 'inactive'}</span>
            </p>
            <p className="text-gray-300 mb-4">
            Plan: <span className="text-white">{subscription?.plan || 'none'}</span>
            </p>

            <div className="flex gap-3">
            <button
                onClick={() => activateSubscription('monthly')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded hover:opacity-90 transition"
            >
                Monthly
            </button>

            <button
                onClick={() => activateSubscription('yearly')}
                className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded hover:opacity-90 transition"
            >
                Yearly
            </button>
            </div>
        </div>

        {/* SCORE */}
        <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl mb-3 font-semibold">Add Score</h2>

            <div className="flex gap-3">
            <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="1–45"
                className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
            />

            <button
                onClick={addScore}
                className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600 transition"
            >
                Add
            </button>
            </div>
        </div>

        {/* SCORES */}
        <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow mb-6">
            <h2 className="text-xl mb-3 font-semibold">Your Scores</h2>

            {scores.map((s) => (
            <div
                key={s.id}
                className="bg-gray-900 p-3 mb-2 rounded flex justify-between hover:bg-gray-700 transition"
            >
                <span>{s.score}</span>
                <span>{new Date(s.played_at).toLocaleDateString()}</span>
            </div>
            ))}
        </div>

        {/* DRAW */}
        <div className="bg-gray-800/60 backdrop-blur p-6 rounded-2xl shadow">
            <h2 className="text-xl mb-3 font-semibold">Monthly Draw 🎲</h2>

            <button
            onClick={generateDraw}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded mb-4 hover:opacity-90 transition"
            >
            Generate Draw
            </button>

            {latestDraw && (
            <div className="mb-4">
                <p className="mb-2 text-gray-300">Draw Numbers</p>

                <div className="flex gap-3">
                {latestDraw.numbers.map((n, i) => (
                    <div
                    key={i}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-bold"
                    >
                    {n}
                    </div>
                ))}
                </div>
            </div>
            )}

            <p className="text-lg">Matches: {matchCount}</p>

            {matchCount === 3 && <p className="text-green-400">🎉 Small Win</p>}
            {matchCount === 4 && <p className="text-yellow-400">🔥 Big Win</p>}
            {matchCount === 5 && <p className="text-pink-400 text-xl">💰 Jackpot</p>}
        </div>
        </div>
    </div>
    );
}