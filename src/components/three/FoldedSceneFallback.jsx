export default function FoldedSceneFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* No blur-[120px] — use lighter radial gradients instead */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 30% 25%, rgba(34,211,238,0.10), transparent 70%),' +
            'radial-gradient(ellipse 55% 45% at 70% 65%, rgba(139,92,246,0.08), transparent 70%)',
        }}
      />
    </div>
  );
}