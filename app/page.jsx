export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl mb-4">Golf Charity App</h1>

      <div className="flex gap-4">
        <a href="/login" className="bg-purple-500 px-4 py-2 rounded">
          Login
        </a>

        <a href="/signup" className="bg-green-500 px-4 py-2 rounded">
          Signup
        </a>
      </div>
    </div>
  );
}