/**
 * HermesShell - device frame with palette-token backgrounds and neon border framing.
 */
export default function HermesShell({ children }) {
  return (
    <div className="h-dvh w-full flex items-center justify-center p-3 sm:p-4 overflow-hidden md:overflow-visible hermes-bg transition-colors duration-300 relative z-10 md:min-h-screen md:h-auto md:flex md:items-center md:justify-center md:px-8 md:py-8">
      <div className="w-full max-w-md h-full max-h-full flex flex-col border-2 rounded-2xl overflow-hidden hermes-border transition-colors duration-300 mx-auto md:min-h-0 md:h-auto md:max-h-[88vh] md:max-w-4xl md:border-2 md:rounded-2xl md:overflow-hidden md:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        {children}
      </div>
    </div>
  )
}
