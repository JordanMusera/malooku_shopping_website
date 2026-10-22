'use client';

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <div role="alert" className="p-8 text-center">
      <p>Unable to load this product.</p>
      <button onClick={reset} className="mt-4 rounded bg-pink-400 px-4 py-2 text-white">Try again</button>
    </div>
  );
}