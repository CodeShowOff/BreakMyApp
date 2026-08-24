export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">BreakMyApp</h1>
      </div>
      <div className="text-center max-w-2xl">
        <p className="text-xl text-gray-300 mb-8">
          Production-grade SaaS for authorized adversarial testing.
        </p>
        <p className="text-md text-gray-400">
          The control plane is initializing...
        </p>
      </div>
    </main>
  );
}
