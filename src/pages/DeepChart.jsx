import React, { useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../lib/ProfileContext';
import { useCalculation } from '../lib/CalculationContext';
import { useChartData } from '../hooks/useAstro';
import { Download, Share2, Activity, Layers, Zap } from 'lucide-react';
import { PageTransition, FadeUp } from '../lib/animations';
import { Layout } from '../components/Shared/Layout';
import { Card } from '../components/Shared/Card';
import { exportChartPDF } from '../lib/pdfExport';
import { useToast } from '../lib/ToastContext';
import { useTitle } from '../hooks/useTitle';
import { LoadingProgress } from '../components/Shared/LoadingProgress';
import { getDailyInsights } from '../lib/astro/insights';
import { Badge } from '../components/Shared/Badge';

// Lazy load heavy components
const NorthChart = lazy(() => import('../components/Chart/NorthChart'));

export default function DeepChart() {
  useTitle('Interpretation');
  const [activeVarga, setActiveVarga] = useState('D1');
  const [exporting, setExporting] = useState(false);
  const [calcMode, setCalcMode] = useState('parashari');
  const { activeProfile, settings, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: astro } = useChartData();
  const { isCalculating, progress, currentTask } = useCalculation();

  // Fast memo for current varga data
  const currentVarga = useMemo(
    () => astro?.vargas?.[activeVarga] || astro?.vargas?.D1,
    [astro, activeVarga]
  );

  const vargasList = useMemo(() => [
    { id: 'D1', label: 'Rashi (Life)', icon: '1' },
    { id: 'D9', label: 'Navamsha (Fruit)', icon: '9' },
    { id: 'D10', label: 'Dashamsha (Work)', icon: '10' },
    { id: 'D7', label: 'Saptamsha (Legacy)', icon: '7' },
    { id: 'D3', label: 'Drekkana (Energy)', icon: '3' },
  ], []);

  const handleExport = async () => {
    if (!activeProfile || !astro) return;
    setExporting(true);
    try {
      const insights = getDailyInsights(activeProfile);
      await exportChartPDF(activeProfile, astro, insights);
      toast.success('Download Started', 'Your celestial report is being generated.');
    } catch {
      toast.error('Export Error', 'Unable to prepare PDF interpretation.');
    } finally {
      setExporting(false);
    }
  };

  if (profileLoading) {
    return (
      <Layout>
        <LoadingProgress
          label="Restoring your profile"
          details="Loading your saved subject and personalized settings."
        />
      </Layout>
    );
  }

  if (!activeProfile) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-500">No subject selected</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-500 underline">
            Return to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  if (!astro) {
    return (
      <Layout>
        <LoadingProgress
          label="Calculating your chart"
          details={currentTask || 'Building your natal map and generating insight layers.'}
          progress={Math.round(progress)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageTransition>
        <div className="space-y-8 md:space-y-12">
          {/* Progress indicator if calculating */}
          {isCalculating && (
            <div className="rounded-3xl border border-blue-500/30 bg-blue-950/20 p-4 shadow-2xl shadow-blue-500/10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-300 font-semibold">Chart calculation in progress</p>
                  <p className="text-sm text-gray-300 mt-1">{currentTask || 'Preparing your chart analysis...'}</p>
                </div>
                <span className="text-xs font-bold text-blue-200">{progress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Header Action Bar */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge-blue">Systemic Analysis</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">{activeProfile.name}</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white uppercase italic font-serif">
                Natal Interpretation
              </h1>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn-secondary flex-1 md:flex-none shadow-xl"
              >
                <Download size={14} className={exporting ? 'animate-bounce' : ''} />
                Export Data
              </button>
              <button className="flex items-center justify-center p-3.5 rounded-xl bg-blue-600/10 border border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-600/5 active:scale-95 group">
                <Share2 size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </section>

          {/* Core Layout: Chart then Timeline */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-start">
            {/* Chart Visualization */}
            <div className="w-full space-y-4 md:space-y-6">
              <div className="flex bg-gray-900/50 p-1 rounded-xl w-full sm:w-fit mb-2">
                <button
                  onClick={() => setCalcMode('parashari')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    calcMode === 'parashari' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  Parashari
                </button>
                <button
                  onClick={() => setCalcMode('kp')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    calcMode === 'kp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  KP Mode
                </button>
              </div>

              {calcMode === 'kp' && settings?.ayanamsaSystem !== 'krishnamurti' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                  <p className="text-amber-500 text-xs font-medium">
                    KP requires Krishnamurti ayanamsa for pinnacle accuracy. Please switch in Settings → Calculation Preferences.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Divisional Projection</h2>
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 sm:pb-0 scroll-smooth snap-x">
                  {vargasList.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setActiveVarga(v.id)}
                      className={`
                        px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shrink-0 snap-start
                        ${
                          activeVarga === v.id
                            ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20 shadow-blue-600/5 shadow-inner'
                            : 'bg-gray-900 text-gray-600 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      {v.id}
                    </button>
                  ))}
                </div>
              </div>

              <Card className="flex items-center justify-center min-h-[350px] md:min-h-[500px] bg-gradient-to-br from-blue-950/20 via-[#030303] to-[#000000] p-2 md:p-10 overflow-hidden relative border-blue-600/20 group hover:border-blue-500/40 transition-colors duration-700 shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="w-full max-w-[320px] md:max-w-md lg:max-w-full aspect-square relative z-10 transition-transform duration-1000 group-hover:scale-[1.02]">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}>
                    <NorthChart
                      positions={currentVarga.positions}
                      ascendantSign={currentVarga.ascendant.sign ?? currentVarga.ascendant.signIndex}
                    />
                  </Suspense>
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Rising</span>
                  <span className="text-sm font-bold text-white">{astro.vargas.D1.ascendant.sign || astro.vargas.D1.ascendant.signIndex}</span>
                  <span className="text-[10px] text-gray-400">{Math.floor(astro.vargas.D1.ascendant.longitude % 30)}°</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Nakshatra</span>
                  <span className="text-sm font-bold text-white">{astro.vargas.D1.positions.Moon.nakshatra}</span>
                  <span className="text-[10px] text-gray-400">Pada {astro.vargas.D1.positions.Moon.pada}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900/50 border border-gray-800">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Atmakaraka</span>
                  <span className="text-sm font-bold text-white">{astro.yogas?.[0]?.name || 'Jupiter'}</span>
                  <span className="text-[10px] text-gray-400">Soul Planet</span>
                </div>
              </div>
            </div>

            {/* Timeline Placeholder - Simplified for now */}
            <div className="w-full space-y-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 px-1">Temporal Timeline</h2>
              <Card className="h-full max-h-[500px] md:max-h-[600px] overflow-y-auto no-scrollbar p-6">
                <div className="space-y-4">
                  {(astro.dashaTimeline || astro.mahaDashas || []).slice(0, 5).map((d, index) => {
                    const isActive = d.planet === astro.currentDasha?.maha.planet;
                    return (
                      <div
                        key={index}
                        className={`flex items-start gap-4 md:gap-6 transition-all ${isActive ? 'scale-[1.02]' : ''}`}
                      >
                        <div className="w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-black shrink-0">
                          {isActive ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-gray-800 rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                            <span className={`text-xs md:text-sm font-bold uppercase tracking-widest ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                              {d.planet} Maha Dasha
                            </span>
                            <span className="text-[10px] mono text-gray-500">
                              {new Date(d.startDate).getFullYear()} - {new Date(d.endDate).getFullYear()}
                            </span>
                          </div>
                          {isActive && (
                            <div className="p-3 md:p-4 rounded-xl border border-blue-600/30 bg-blue-600/10">
                              <div className="flex justify-between items-center text-[10px] md:text-xs">
                                <span className="text-gray-400 uppercase tracking-widest font-bold">
                                  Phase: <strong className="text-white ml-1">{astro.currentDasha.antar.planet}</strong>
                                </span>
                                <Badge variant="blue" className="animate-pulse">Active Now</Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Simplified Data Section */}
          {calcMode === 'parashari' && (
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <Activity size={16} className="text-gray-500" />
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Planetary Metrics ({activeVarga})</h2>
              </div>

              <Card noPadding className="overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-[#050505] border-b border-gray-800">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Graha</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Rashi (Sign)</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Degrees</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Nakshatra</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">Strength Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(currentVarga.positions).map(([name, data]) => {
                        const strength = astro.shadbala?.find(s => s.planet === name);
                        return (
                          <tr key={name} className="border-b border-gray-900 group hover:bg-gray-900/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 whitespace-nowrap">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${data.isUpagraha ? 'bg-amber-900/30 text-amber-500' : 'bg-gray-800 text-white'} uppercase`}>
                                  {name.slice(0, 2)}
                                </div>
                                <span className={`font-bold uppercase text-xs ${data.isUpagraha ? 'text-amber-500' : 'text-white'}`}>{name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-gray-300 text-sm font-medium whitespace-nowrap">{data.sign}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="mono text-gray-400 text-sm whitespace-nowrap">
                                {Math.floor(data.longitude % 30)}° {Math.floor((data.longitude % 1) * 60)}' {(data.isRetrograde ? ' (R)' : '')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col whitespace-nowrap">
                                <span className="text-xs font-semibold text-white">{data.nakshatra}</span>
                                <span className="text-[10px] text-gray-500 uppercase">Pada {data.pada}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {strength ? (
                                <div className="flex items-center gap-3 min-w-[120px]">
                                  <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 rounded-full"
                                      style={{ width: `${strength.percentage}%` }}
                                    />
                                  </div>
                                  <span className={strength.grade === 'Strong' ? 'badge-green' : (strength.grade === 'Moderate' ? 'badge-blue' : 'badge-red')}>
                                    {strength.grade.slice(0, 4)}
                                  </span>
                                </div>
                              ) : <span className="text-gray-600">—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}

          {/* Yogas Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Active Yogas (D1)</h3>
              </div>
              <div className="space-y-4">
                {astro.yogas?.slice(0, 4).map((y, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <span className="text-sm font-bold uppercase text-white tracking-tight">{y.name}</span>
                    <span className={y.strength === 'Strong' ? "badge-green" : "badge-blue"}>{y.strength}</span>
                  </div>
                ))}
                {(!astro.yogas || astro.yogas.length === 0) && (
                  <div className="text-center py-4 text-gray-500 text-sm">No major yogas detected.</div>
                )}
              </div>
            </Card>

            <Card className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">Transit Potentials (Ashtakavarga)</h3>
              </div>
              <div className="space-y-4">
                {['Jupiter', 'Saturn'].map(p => {
                  const signIdx = astro.vargas.D1.positions[p].sign ?? astro.vargas.D1.positions[p].signIndex ?? 0;
                  const score = astro.ashtakavarga?.[p]?.scores?.[signIdx] ?? 0;
                  return (
                    <div key={p} className="space-y-1">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-400 font-bold uppercase tracking-tighter">{p} Transit Score</span>
                        <span className="mono text-white">{score} / 8</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${(score / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
        </div>
      </PageTransition>
    </Layout>
  );
}
