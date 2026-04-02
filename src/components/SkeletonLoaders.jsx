import React from 'react';

const Shimmer = ({ className }) => (
  <div className={`relative overflow-hidden bg-gray-900 rounded-lg ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 md:space-y-12 animate-pulse w-full max-w-7xl mx-auto">
    {/* Subject Selection Header */}
    <div className="flex flex-col items-center gap-3 md:gap-6">
      <div className="flex items-center justify-between w-full">
        <Shimmer className="w-32 h-4 rounded-full" />
        <Shimmer className="w-24 h-4 rounded-full" />
      </div>
      <div className="flex flex-nowrap items-center gap-2 p-1 bg-gray-900/20 rounded-2xl border border-gray-800/20 w-full overflow-hidden">
         {[1, 2, 3].map(i => <Shimmer key={i} className="w-24 md:w-32 h-10 rounded-xl shrink-0" />)}
      </div>
    </div>

    {/* Hero Card / Daily Score */}
    <div className="p-6 md:p-10 rounded-2xl bg-gray-900/20 border border-gray-800/10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
       <div className="flex flex-col items-center shrink-0 space-y-2 relative pt-2">
          <Shimmer className="w-20 h-2" />
          <Shimmer className="w-24 h-24 rounded-full" />
       </div>
       <div className="flex-1 space-y-4 w-full">
          <Shimmer className="w-3/4 md:w-1/2 h-10" />
          <div className="space-y-2 w-full max-w-2xl">
             <Shimmer className="w-full h-4" />
             <Shimmer className="w-5/6 h-4" />
             <Shimmer className="w-4/6 h-4" />
          </div>
       </div>
       <div className="w-full md:w-auto p-4 rounded-2xl border border-gray-800 flex flex-col items-center justify-center min-w-[140px] h-20 md:h-24 space-y-2">
          <Shimmer className="w-16 h-2" />
          <Shimmer className="w-20 h-5" />
       </div>
    </div>

    {/* Critical Windows */}
    <div className="space-y-4">
      <Shimmer className="w-32 h-3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
         {[1, 2, 3, 4].map(i => (
           <div key={i} className="py-6 rounded-2xl bg-gray-900/10 border border-gray-800 flex flex-col items-center gap-3">
              <Shimmer className="w-16 h-2 mx-auto" />
              <Shimmer className="w-24 h-4 mx-auto mt-1" />
              <div className="flex gap-1 mt-1">
                 <Shimmer className="w-1 h-1 rounded-full mx-0" />
                 <Shimmer className="w-1 h-1 rounded-full mx-0" />
                 <Shimmer className="w-1 h-1 rounded-full mx-0" />
              </div>
           </div>
         ))}
      </div>
    </div>

    {/* Panchang */}
    <div className="space-y-4">
      <Shimmer className="w-48 h-3" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
         {[1, 2, 3, 4, 5].map(i => (
           <div key={i} className="py-6 rounded-2xl bg-gray-900/10 border border-gray-800 flex flex-col items-center gap-2">
              <Shimmer className="w-12 h-2" />
              <Shimmer className="w-20 h-5 mt-1" />
              <Shimmer className="w-16 h-2" />
           </div>
         ))}
      </div>
    </div>

    {/* Strip Widgets */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
       {[1, 2, 3, 4].map(i => (
         <div key={i} className="py-6 px-4 rounded-2xl bg-gray-900/10 border border-gray-800 flex flex-col items-center gap-3">
            <Shimmer className="w-16 h-2" />
            <Shimmer className="w-20 h-8" />
         </div>
       ))}
    </div>

    {/* Dasha & Monthly Cycle */}
    <div className="space-y-6">
       <div className="p-6 md:p-8 rounded-2xl bg-gray-900/10 border-l-4 border-gray-800 border-y border-r flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
          <div className="flex items-center gap-4 md:gap-5">
             <Shimmer className="w-12 h-12 rounded-full shrink-0" />
             <div className="space-y-2">
                <Shimmer className="w-20 h-2" />
                <Shimmer className="w-32 h-6" />
             </div>
          </div>
          <div className="hidden md:block h-12 w-px bg-gray-800" />
          <div className="flex-1 space-y-3">
              <Shimmer className="w-24 h-2" />
              <div className="flex justify-between items-center">
                 <Shimmer className="w-32 h-5" />
                 <Shimmer className="w-24 h-2" />
              </div>
          </div>
       </div>

       <div className="space-y-4">
          <Shimmer className="w-32 h-3" />
          <div className="p-6 md:p-8 rounded-2xl border-l-4 border-gray-800 border-y border-r bg-gray-900/10">
             <div className="flex justify-between items-center mb-3">
                <Shimmer className="w-48 h-6" />
                <Shimmer className="w-20 h-5 rounded-full" />
             </div>
             <Shimmer className="w-3/4 h-4 mt-2" />
             <Shimmer className="w-2/3 h-4 mt-1" />
          </div>
       </div>
    </div>
  </div>
);

export const DeepChartSkeleton = () => (
  <div className="space-y-8 md:space-y-12 animate-pulse w-full max-w-7xl mx-auto">
    <div className="flex justify-between items-center px-1">
      <div className="space-y-3">
         <div className="flex gap-2">
            <Shimmer className="w-24 h-5 rounded-full" />
            <Shimmer className="w-24 h-4" />
         </div>
         <Shimmer className="w-48 md:w-64 h-8 md:h-10" />
      </div>
      <div className="flex gap-2">
         <Shimmer className="w-24 md:w-32 h-10 rounded-xl" />
         <Shimmer className="w-12 md:w-14 h-10 rounded-xl" />
      </div>
    </div>

    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
      {/* Chart Panel */}
      <div className="w-full space-y-4 md:space-y-6">
        <Shimmer className="w-48 h-8 rounded-lg mb-2" />
        <div className="flex justify-between items-center gap-4 px-1">
           <Shimmer className="w-32 h-3" />
           <div className="flex gap-2">
             {[1,2,3,4,5].map(i => <Shimmer key={i} className="w-10 h-6 rounded-lg" />)}
           </div>
        </div>
        <div className="h-[350px] md:h-[500px] w-full rounded-2xl bg-gray-900/20 border border-gray-800 p-8 flex items-center justify-center">
           <Shimmer className="w-[85%] h-[85%] rounded-full opacity-50" />
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {[1,2,3].map(i => (
             <div key={i} className="h-20 w-full rounded-2xl bg-gray-900/10 border border-gray-800 flex flex-col justify-center items-center gap-2">
                <Shimmer className="w-16 h-2" />
                <Shimmer className="w-20 h-4" />
             </div>
          ))}
        </div>
      </div>

      {/* Timeline Panel */}
      <div className="w-full space-y-6">
        <Shimmer className="w-32 h-3 px-1" />
        <div className="h-[500px] md:h-[600px] rounded-2xl bg-gray-900/10 border border-gray-800 p-6 space-y-6 overflow-hidden relative">
           <div className="absolute left-[34px] top-6 bottom-6 w-px bg-gray-800" />
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex items-start gap-6 relative z-10">
                 <Shimmer className="w-6 h-6 rounded-full shrink-0 border-4 border-gray-950" />
                 <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                       <Shimmer className="w-24 h-4" />
                       <Shimmer className="w-16 h-3" />
                    </div>
                    <Shimmer className="w-full h-16 rounded-xl mt-2" />
                 </div>
             </div>
           ))}
        </div>
      </div>
    </div>
    
    <div className="space-y-6 pt-4">
       <div className="flex items-center gap-3">
          <Shimmer className="w-4 h-4 rounded-full" />
          <Shimmer className="w-48 h-3" />
       </div>
       <Shimmer className="w-full h-64 rounded-2xl" />
    </div>
  </div>
);

export const VaultSkeleton = () => (
   <div className="space-y-6 w-full max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
         <div className="space-y-1">
           <Shimmer className="w-32 h-3" />
           <Shimmer className="w-48 h-8" />
         </div>
         <Shimmer className="w-32 h-10 rounded-xl" />
      </div>
      <div className="flex gap-4 items-center">
         <Shimmer className="w-full max-w-xs h-12 rounded-xl" />
         <Shimmer className="w-16 h-4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="p-6 rounded-2xl bg-gray-900/10 border border-gray-800 flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <Shimmer className="w-12 h-12 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                   <Shimmer className="w-3/4 h-5" />
                   <Shimmer className="w-1/2 h-3" />
                </div>
             </div>
             <Shimmer className="w-1/3 h-3 mt-2" />
          </div>
        ))}
      </div>
   </div>
);

export const ChartSkeleton = DeepChartSkeleton;
