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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              AI
            </div>
            <span className="text-xs text-gray-500">
              {timestamp.toLocaleTimeString()}
            </span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {isUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-gray-500">
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

