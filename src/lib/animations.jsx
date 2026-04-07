import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';


/* ── Fade + rise on scroll into view ─────────────────────── */
export function FadeUp({ children, delay = 0, duration = 0.7, y = 40 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>

  );
}

/* ── Stagger children on scroll ──────────────────────────── */
export function StaggerParent({ children, stagger = 0.12, delay = 0, component = 'div', className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const MotionComponent = motion[component] || motion.div;
  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </MotionComponent>
  );
}

/* ── Child variant for StaggerParent ─────────────────────── */
export function StaggerChild({ children, y = 30, component = 'div', className }) {
  const MotionComponent = motion[component] || motion.div;
  return (
    <MotionComponent
      className={className}
      variants={{
        hidden:  { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.21, 0.47, 0.32, 0.98] } },
      }}
    >
      {children}
    </MotionComponent>
  );
}

/* ── Parallax scroll drift ────────────────────────────────── */
export function Parallax({ children, speed = 0.3, style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -100}px`, `${speed * 100}px`]);
  return (
    <motion.div ref={ref} style={{ y, ...style }}>
      {children}
    </motion.div>
  );
}

/* ── 3D card tilt on mouse hover ─────────────────────────── */
export function TiltCard({ children, maxTilt = 4, sx = {} }) {

  const ref = useRef(null);
  const handleMouseMove = (e) => {
    if ('ontouchstart' in window) return;
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `
      perspective(900px)
      rotateY(${x * maxTilt * 2}deg)
      rotateX(${-y * maxTilt * 2}deg)
      scale3d(1.02,1.02,1.02)
    `;
    el.style.boxShadow = `
      ${-x * 20}px ${y * 20}px 40px rgba(0,0,0,0.5),
      0 0 30px rgba(59,130,246,${Math.abs(x) * 0.2 + Math.abs(y) * 0.2})
    `;

  };
  const handleMouseLeave = () => {
    if ('ontouchstart' in window) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    el.style.boxShadow = '';
  };
  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease, box-shadow 0.15s ease', willChange: 'transform', backfaceVisibility: 'hidden', ...sx }}
    >
      {children}
    </div>
  );
}

/* ── Reveal text word by word ─────────────────────────────── */
export function WordReveal({ text, delay = 0, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const words = text.split(' ');
  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.5, delay: delay + i * 0.06, ease: 'easeOut' }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/* ── Number count-up ──────────────────────────────────────── */
export function CountUp({ to, duration: _duration = 1.4, decimals = 0, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  if (inView) spring.set(to);
  return (
    <motion.span ref={ref}>
      <motion.span>
        {useTransform(spring, (v) => v.toFixed(decimals) + suffix)}
      </motion.span>
    </motion.span>
  );
}

/* ── Terminal type-in reveal ──────────────────────────────── */
export function TerminalReveal({ text, delay = 0, speed = 28 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView || started) return;
    const timeout = setTimeout(() => {
      setStarted(true);
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [inView, started, text, speed, delay]);

  return (
    <span ref={ref} style={{
      fontFamily: '"Geist Mono", monospace',
      fontSize: '0.875rem',
      color: '#a1a1a1',
      letterSpacing: '0.01em',
    }}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
        style={{ display: 'inline-block', width: 2, height: '1em',
                 background: '#3b82f6', marginLeft: 2, verticalAlign: 'text-bottom' }}
      />
    </span>
  );
}


/* ── Entrance from left/right ─────────────────────────────── */
export function SlideIn({ children, from = 'left', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const x = from === 'left' ? -60 : 60;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Page transition wrapper ──────────────────────────────── */
export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
      exit={{    opacity: 0, y: -12, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Simple one-way fade ──────────────────────────────────── */
export function FadeIn({ children, delay = 0, duration = 0.5 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}


/* ── Pulsing glow dot (for live indicators) ───────────────── */
export function GlowPulse({ color = '#3b82f6', size = 7 }) {

  return (
    <motion.span
      animate={{ scale: [1, 1.6, 1], opacity: [0.9, 0.3, 0.9] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        display: 'inline-block', width: size, height: size, borderRadius: '50%',
        background: color, boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
    />
  );
}
