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

      {/* STARS */}
      <div className="stars"></div>

      {/* FLOATING ASTRONAUT */}
      <img
        src="/assets/astronaut.png"
        alt="astronaut"
        className="astronaut"
      />

      <Component {...pageProps} />
    </>
  )
}
