/**
 * HermesShell - device frame with palette-token backgrounds and neon border framing.
 */
export default function HermesShell({ children }) {
  return (
    <div className="min-h-dvh md:min-h-screen hermes-bg transition-colors duration-300 relative z-10 md:flex md:items-center md:justify-center md:px-8 md:py-8">
      <div className="w-full max-w-md mx-auto min-h-dvh md:min-h-0 md:h-auto md:max-h-[88vh] md:max-w-4xl flex flex-col gap-0 border-x-2 md:border-2 hermes-border transition-colors duration-300 md:rounded-2xl md:overflow-hidden md:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  )
}
