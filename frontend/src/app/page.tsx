export default function Home() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#1B3A5C] mb-4">
          Plan<span className="text-[#0D9488]">View</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          NSW Planning Intelligence — Search any address
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-sm text-gray-500">
            🚧 v2 scaffold — frontend + backend architecture ready.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Backend API: <code className="bg-gray-100 px-2 py-0.5 rounded">localhost:4000</code>
          </p>
        </div>
      </div>
    </main>
  );
}
