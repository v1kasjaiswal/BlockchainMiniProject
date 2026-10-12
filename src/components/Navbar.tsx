export function Navbar() {
  return (
    <header className="border-b-2 border-black bg-white/90 backdrop-blur-md sticky top-0 z-10">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-black" />
          <span className="font-mono text-sm font-black uppercase tracking-[0.25em] text-black">
            CERTCHAIN
          </span>
          <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">
            v1.0
          </span>
        </div>

        {/* Local Node Status */}
        <div className="flex items-center gap-2 border-2 border-black bg-black/[0.04] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-black">
          <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
          <span>LOCAL NODE : 8545</span>
        </div>
      </div>
    </header>
  );
}
