import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';

export default function Activity() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#1C1F26] rounded-[2rem] border border-gray-800 shadow-xl">
      <div className="w-20 h-20 bg-[#FF7A50]/10 rounded-full flex items-center justify-center mb-6">
        <ActivityIcon className="w-10 h-10 text-[#FF7A50]" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Activity Stream</h1>
      <p className="text-gray-400 max-w-md">
        Track your team's latest updates, comments, and task completions in real-time. This module is coming soon!
      </p>
    </div>
  );
}
