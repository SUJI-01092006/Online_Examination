export default function StatusMessage({ children, error = false }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-blue-100 bg-blue-50 text-blue-800"}`}>
      {children}
    </div>
  );
}
