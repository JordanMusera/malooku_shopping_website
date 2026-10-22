export default function LoadingProduct() {
  return (
    <div role="status" aria-label="Loading product" className="p-6 pt-20 grid grid-cols-1 xl:grid-cols-2 gap-8 animate-pulse">
      <div className="h-96 rounded-xl bg-gray-100" />
      <div className="space-y-6">
        <p className="text-pink-500">Loading product...</p>
        <div className="h-8 w-3/4 rounded bg-gray-100" />
        <div className="h-6 w-1/3 rounded bg-gray-100" />
        <div className="h-32 rounded bg-gray-100" />
      </div>
    </div>
  );
}