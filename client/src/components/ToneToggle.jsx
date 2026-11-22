/**
 * The "Vibe Check" tone selector.
 * Lets the user pick Professional, Casual, or Concise.
 * The chosen tone is sent with every message → the backend converts it
 * to a system instruction that reshapes the AI's reply style instantly.
 */
const TONES = [
  {
    value: "professional",
    label: "Professional",
    icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M8.5 7a4 4 0 1 0 0 .01z M20 8v6 M23 11h-6",
  },
  {
    value: "casual",
    label: "Casual",
    icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z",
  },
  {
    value: "concise",
    label: "Concise",
    icon: "M4 6h16 M4 12h10 M4 18h6",
  },
];

export default function ToneToggle({ tone, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-400">Tone:</span>
      <div className="flex rounded-xl bg-slate-100 p-1 gap-0.5">
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              tone === t.value
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={t.icon} />
            </svg>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
