import { motion } from 'framer-motion';
import './SplashScreen.css';

const particles = [
  { x: -86, y: -68, delay: 0.05 },
  { x: 82, y: -76, delay: 0.12 },
  { x: -104, y: 18, delay: 0.2 },
  { x: 106, y: 22, delay: 0.28 },
  { x: -68, y: 88, delay: 0.36 },
  { x: 72, y: 92, delay: 0.44 },
];

const SplashScreen = () => (
  <motion.div
    className="splash-screen"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.035 }}
    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
    role="status"
    aria-label="Loading NSRIT Connect"
  >
    <span className="splash-corner splash-corner--top" />
    <span className="splash-corner splash-corner--bottom" />

    <motion.div
      className="splash-brand"
      initial={{ opacity: 0, y: 28, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="splash-particles" aria-hidden="true">
        {particles.map((particle, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.9, 0.45],
              x: particle.x,
              y: particle.y,
              scale: [0, 1, 0.75],
            }}
            transition={{ duration: 1.35, delay: particle.delay, ease: 'easeOut' }}
          />
        ))}
      </div>

      <div className="splash-logo-crop">
        <img
          src="/nsrit-splash-logo.png"
          alt="Nadimpalli Satyanarayana Raju International Techno School"
          draggable="false"
        />
      </div>

      <motion.div
        className="splash-loader"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.7, duration: 0.75, ease: 'easeOut' }}
        aria-hidden="true"
      >
        <span />
      </motion.div>
    </motion.div>
  </motion.div>
);

export default SplashScreen;
