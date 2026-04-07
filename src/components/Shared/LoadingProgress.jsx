import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingProgress = ({
  label = 'Loading',
  details = 'Please wait while the system prepares your data.',
  progress = null,
}) => {
  const hasProgress = typeof progress === 'number' && !Number.isNaN(progress);
  const safeProgress = hasProgress ? Math.max(0, Math.min(100, Math.round(progress))) : null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-blue-500/10">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-400">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-semibold">{label}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                {safeProgress !== null ? `${safeProgress}% Complete` : 'Working on it...'}
              </h2>
            </div>
          </div>

          <p className="text-sm text-gray-400 leading-relaxed">{details}</p>

          <div className="w-full rounded-full bg-slate-900/90 border border-white/10 overflow-hidden h-4">
            <motion.div
              className="h-4 bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300"
              initial={{ width: '0%' }}
              animate={{ width: safeProgress !== null ? `${safeProgress}%` : ['0%', '100%'] }}
              transition={{ duration: safeProgress !== null ? 0.4 : 1.4, repeat: safeProgress === null ? Infinity : 0, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingProgress;
