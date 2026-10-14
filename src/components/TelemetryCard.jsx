import React from 'react';

export default function TelemetryCard({
  icon: Icon,
  label,
  value,
  subValue,
  unit,
  badge,
  badgeColor = 'cyan',
  accentColor = 'cyan',
  isLoading = false
}) {
  const getAccentBorders = () => {
    switch (accentColor) {
      case 'violet':
        return 'border-violet-500/20 hover:border-violet-500/40 shadow-violet-950/20';
      case 'amber':
        return 'border-amber-500/20 hover:border-amber-500/40 shadow-amber-950/20';
      case 'emerald':
        return 'border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-950/20';
      case 'rose':
        return 'border-rose-500/20 hover:border-rose-500/40 shadow-rose-950/20';
      case 'cyan':
      default:
        return 'border-cyan-500/20 hover:border-cyan-500/40 shadow-cyan-950/20';
    }
  };

  const getBadgeClasses = () => {
    switch (badgeColor) {
      case 'emerald':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800';
      case 'amber':
        return 'bg-amber-950/70 text-amber-300 border-amber-800';
      case 'violet':
        return 'bg-violet-950/70 text-violet-300 border-violet-800';
      case 'rose':
        return 'bg-rose-950/70 text-rose-300 border-rose-800';
      case 'cyan':
      default:
        return 'bg-cyan-950/70 text-cyan-300 border-cyan-800';
    }
  };

  const getIconColor = () => {
    switch (accentColor) {
      case 'violet': return 'text-violet-400';
      case 'amber': return 'text-amber-400';
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/70 backdrop-blur-sm border p-4 transition-all duration-300 shadow-lg ${getAccentBorders()}`}
    >
      {/* Background glow decoration */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none"></div>

      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
          {Icon && <Icon className={`w-4 h-4 ${getIconColor()}`} />}
          {label}
        </span>
        {badge && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getBadgeClasses()}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Main telemetry value */}
      <div className="mt-1 flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-28 bg-slate-800/80 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-50 flex items-baseline">
            <span>{value !== null && value !== undefined ? value : '--'}</span>
            {unit && <span className="ml-1 text-sm font-sans font-normal text-slate-400">{unit}</span>}
          </div>
        )}
      </div>

      {/* Sub-value or secondary converted unit */}
      <div className="mt-1.5 text-xs font-mono text-slate-400">
        {isLoading ? (
          <div className="h-3.5 w-20 bg-slate-800/50 rounded animate-pulse"></div>
        ) : (
          subValue || '\u00A0'
        )}
      </div>
    </div>
  );
}
