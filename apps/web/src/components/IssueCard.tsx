'use client';

import { GoodFirstIssue } from '../types/issue';

interface IssueCardProps {
  issue: GoodFirstIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { Issue } = issue;

  return (
    <a
      href={Issue.issue_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-white/40 hover:border-indigo-400 hover:-translate-y-1 hover:scale-[1.02] group"
    >
      {/* Repository Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1.5 group-hover:text-indigo-600 transition-colors">
            {Issue.issue_repo.Owner.repo_owner}/{Issue.issue_repo.repo_name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {Issue.issue_repo.repo_desc}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-yellow-500 ml-3 bg-yellow-50 px-2.5 py-1 rounded-full">
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-bold">{Issue.issue_repo.repo_stars}</span>
        </div>
      </div>

      {/* Issue Title */}
      <h4 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">
        {Issue.issue_title}
      </h4>

      {/* Languages */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {Issue.issue_repo.repo_langs.Nodes.slice(0, 3).map((lang, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200/50"
          >
            {lang.repo_prog_language}
          </span>
        ))}
      </div>

      {/* Labels */}
      {Issue.issue_labels.Nodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Issue.issue_labels.Nodes.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
            >
              {label.label_name}
            </span>
          ))}
        </div>
      )}

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>{Issue.Comments.issue_comment_count} comments</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            {Issue.Assignees.issue_assignees_count === 0
              ? 'Unassigned'
              : `${Issue.Assignees.issue_assignees_count} assigned`}
          </span>
        </div>
      </div>
    </a>
  );
}

