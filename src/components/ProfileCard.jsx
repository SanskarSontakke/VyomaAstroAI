import React from 'react';
import { 
  Trash2, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './Shared/Card';

export default function ProfileCard({ 
  profile, 
  active = false, 
  onSelect, 
  onDelete, 
  onExport, 
  onShare 
}) {
  if (!profile) return null;

  return (
    <Card 
      onClick={onSelect}
      className={`
        group relative cursor-pointer transition-all duration-500 active:scale-[0.98] overflow-hidden
        ${active ? 'border-blue-600/40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030303] to-[#010105]' : 'bg-gray-900/10 hover:border-gray-600 hover:bg-gray-900/30 text-gray-500 hover:text-gray-200'}
      `}
    >
      {/* Active Indicator */}
      {active && (
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 shadow-[2px_0_10px_rgba(59,130,246,0.2)]" />
      )}

      <div className="flex items-start gap-4">
        {/* Avatar/Initial */}
        <div className={`
          w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base md:text-lg transition-colors
          ${active ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 group-hover:bg-gray-800 group-hover:text-gray-200'}
        `}>
          {profile.name.substring(0, 2).toUpperCase()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate">
              {profile.name}
            </h3>
            {profile.is_primary && (
              <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                Primary
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar size={12} className="shrink-0" />
              <span className="text-[10px] mono uppercase tracking-tight">{profile.dob_date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={12} className="shrink-0" />
              <span className="text-[10px] uppercase truncate tracking-tight">{profile.pob_city || `${profile.latitude?.toFixed(2)}, ${profile.longitude?.toFixed(2)}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Overlay - Always visible on mobile, hover on desktop */}
      <div className="mt-5 pt-4 border-t border-gray-900/50 flex justify-between items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          {onExport && (
            <button 
              aria-label="Export"
              onClick={(e) => { e.stopPropagation(); onExport(); }}
              className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-white transition-all active:bg-gray-800"
            >
              <Download size={14} />
            </button>
          )}
          {onShare && (
            <button 
              aria-label="Share"
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-500 hover:text-white transition-all active:bg-gray-800"
            >
              <Share2 size={14} />
            </button>
          )}
        </div>
        
        <div className="flex gap-1.5 items-center">
          {onDelete && (
            <button 
              aria-label="Delete"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-gray-600 hover:text-red-500 transition-all active:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          )}
          <div className="p-2 text-blue-500 bg-blue-500/5 rounded-lg ml-1">
             <ChevronRight size={18} />
          </div>
        </div>
      </div>

      {!active && (
        <div className="absolute bottom-4 right-4 opacity-100 lg:group-hover:opacity-0 transition-opacity">
           <ChevronRight size={14} className="text-gray-800" />
        </div>
      )}
    </Card>
  );
}
