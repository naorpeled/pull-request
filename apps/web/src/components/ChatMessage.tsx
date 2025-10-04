'use client';

import { GoodFirstIssue } from '../types/issue';
import { IssueCard } from './IssueCard';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  issues?: GoodFirstIssue[];
  timestamp: Date;
}

export function ChatMessage({ role, content, issues, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-300/50 ring-2 ring-white">
              AI
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-5 py-3.5 shadow-md transition-all hover:shadow-lg ${
            isUser
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-white/20'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>

        {isUser && (
          <div className="flex justify-end mt-1.5">
            <span className="text-xs text-gray-500 font-medium">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Display issues if any */}
        {issues && issues.length > 0 && (
          <div className="mt-4 space-y-3">
            {issues.map((issue, index) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

