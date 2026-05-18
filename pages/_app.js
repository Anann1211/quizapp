import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return (
    <>
      {/* VIDEO BACKGROUND */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="space-bg"
      >
        <source
          src="/assets/astronaut.mp4"
          type="video/mp4"
        />
      </video>

      {/* OVERLAY */}
      <div className="space-overlay"></div>

      <Component {...pageProps} />
    </>
  )
}
