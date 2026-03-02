/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  ArrowUpRight, 
  ShieldCheck,
  PieChart as PieChartIcon,
  Plus,
  Check
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Account {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  baseValue: number;
}

const ACCOUNTS: Account[] = [
  { 
    id: 'robinhood', 
    name: 'Individual', 
    provider: 'Robinhood', 
    icon: '', 
    color: '#00C805',
    baseValue: 12500
  },
  { 
    id: 'schwab', 
    name: 'Roth IRA', 
    provider: 'Schwab', 
    icon: '', 
    color: '#00A0DC',
    baseValue: 45000
  },
  { 
    id: 'fidelity', 
    name: 'Traditional IRA', 
    provider: 'Fidelity', 
    icon: '', 
    color: '#339933',
    baseValue: 82000
  },
  { 
    id: 'fennel', 
    name: 'Joint Account', 
    provider: 'Fennel', 
    icon: '', 
    color: '#4B0082',
    baseValue: 15000
  },
];

const BASE_INCOME = 50000;

export default function App() {
  const [activeAccountIds, setActiveAccountIds] = useState<Set<string>>(new Set([ACCOUNTS[0].id]));
  const [timeRange, setTimeRange] = useState('3M');

  // Live-editable Toggle Switch Configuration
  const [config, setConfig] = useState({
    width: 62,
    height: 31,
    radius: 20,
    strokeWidth: 2,
    knobSize: 24,
    active: {
      trackFill: 'rgba(22, 93, 252, 0.1)',
      trackStroke: '#165DFC',
      knobFill: '#165DFC',
    },
    inactive: {
      trackFill: 'rgba(35, 50, 68, 0.2)',
      trackStroke: 'rgba(35, 50, 68, 0.1)',
      knobFill: '#FFFFFF',
    }
  });

  const toggleAccount = (id: string) => {
    const next = new Set(activeAccountIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setActiveAccountIds(next);
  };

  const multiplier = activeAccountIds.size;

  // Generate chart data starting from (0,0)
  const chartData = useMemo(() => {
    const points = 40;
    const data = [];
    
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      // A smooth curve starting at 0
      // y = multiplier * (progress^1.4 + subtle wave)
      const curve = Math.pow(progress, 1.4);
      const wave = Math.sin(progress * Math.PI * 3) * 0.015;
      
      data.push({
        name: i,
        value: multiplier * (curve + (i > 0 ? wave : 0)) * 100,
      });
    }
    return data;
  }, [multiplier]);

  return (
    <div className="h-screen bg-white text-[#111827] font-sans selection:bg-blue-100 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-6xl flex flex-col lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center p-4 lg:p-8">
        
        {/* Top/Left: Chart Area (50% on mobile) */}
        <div className="h-1/2 lg:h-auto lg:col-span-8 flex flex-col justify-center">
          <div className="h-full lg:h-[320px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#165DFC" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#165DFC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide padding={{ left: 0, right: 0 }} />
                <YAxis hide domain={[0, 400]} padding={{ bottom: 0, top: 0 }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#165DFC" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={600}
                  isAnimationActive={true}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time Range Selectors at the bottom of chart */}
          <div className="absolute bottom-[52%] left-0 right-0 lg:relative lg:bottom-auto flex items-center justify-center lg:justify-start gap-6 sm:gap-10 px-0 mt-4 lg:mt-6">
            {['1D', '1M', '3M', 'YTD', 'MAX'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "text-xs sm:text-sm font-bold transition-all relative pb-2 lg:pb-3",
                  timeRange === range 
                    ? "text-[#165DFC]" 
                    : "text-gray-900 opacity-80 hover:opacity-100"
                )}
              >
                {range}
                {timeRange === range && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-[#165DFC] rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom/Right: Accounts Sidebar (50% on mobile) */}
        <div className="h-1/2 lg:h-auto lg:col-span-4 flex flex-col justify-center mt-4 lg:mt-0">
          <div className="grid grid-cols-1 gap-y-4 sm:gap-y-6 lg:gap-y-8 lg:h-[320px] content-center">
            {ACCOUNTS.map((account) => {
            const isActive = activeAccountIds.has(account.id);
            return (
              <div 
                key={account.id}
                className="flex items-center justify-between group cursor-pointer py-1"
                onClick={() => toggleAccount(account.id)}
              >
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 leading-tight">{account.name}</div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500">{account.provider}</div>
                  </div>
                </div>

                {/* Toggle Switch - Using live config state */}
                <div 
                  style={{
                    width: config.width,
                    height: config.height,
                    borderRadius: config.radius,
                    backgroundColor: isActive ? config.active.trackFill : config.inactive.trackFill,
                    border: `${config.strokeWidth}px solid ${isActive ? config.active.trackStroke : config.inactive.trackStroke}`,
                  }}
                  className="relative transition-colors duration-300 scale-75 sm:scale-90 lg:scale-100 origin-right"
                >
                  <motion.div 
                    animate={{ x: isActive ? (config.width - config.knobSize - (config.strokeWidth * 2)) : config.strokeWidth }}
                    style={{
                      width: config.knobSize,
                      height: config.knobSize,
                      backgroundColor: isActive ? config.active.knobFill : config.inactive.knobFill,
                      top: (config.height - config.knobSize - (config.strokeWidth * 2)) / 2,
                    }}
                    className="absolute left-0 rounded-full shadow-sm"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Subtle bottom border line like in image */}
      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gray-100" />
    </div>
  );
}
