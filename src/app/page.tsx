export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">EchoVault</h1>
      <p className="text-xl text-neutral-400 mb-8 max-w-2xl text-center">
        Store your memories on Pastebin, then let free local AI generate insights and synthesize connections between them.
      </p>
      <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
        <h2 className="text-lg font-semibold mb-2">Quick Start</h2>
        <ol className="list-decimal list-inside space-y-2 text-neutral-300">
          <li>Set environment variables (see README)</li>
          <li>Run <code className="bg-neutral-700 px-2 py-1 rounded">bun install</code></li>
          <li>Run <code className="bg-neutral-700 px-2 py-1 rounded">bun db:generate</code> and <code className="bg-neutral-700 px-2 py-1 rounded">bun db:migrate</code></li>
          <li>Start dev server: <code className="bg-neutral-700 px-2 py-1 rounded">bun dev</code></li>
          <li>Register a user and start creating memories</li>
        </ol>
      </div>
    </main>
  );
}
