export const getStatColor = (color: string) => {
  switch (color) {
    case 'blue': return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
    case 'green': return 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400';
    case 'purple': return 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400';
    case 'orange': return 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400';
    default: return 'from-slate-500/20 to-slate-600/20 border-slate-500/30 text-slate-400';
  }
};

export const getFeatureColor = (color: string) => {
  switch (color) {
    case 'blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    case 'green': return 'bg-green-500/10 border-green-500/20 text-green-400';
    case 'purple': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
    case 'orange': return 'bg-orange-500/10 border-orange-500/20 text-orange-400';
    default: return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }
};