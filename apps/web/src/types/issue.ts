export interface GoodFirstIssue {
  Issue: {
    issue_url: string;
    issue_createdAt: string;
    issue_repo: {
      repo_name: string;
      repo_desc: string;
      repo_url: string;
      repo_stars: number;
      repo_langs: {
        Nodes: Array<{
          repo_prog_language: string;
        }>;
      };
      Owner: {
        repo_owner: string;
      };
    };
    issue_title: string;
    issue_labels: {
      Nodes: Array<{
        label_name: string;
      }>;
      label_totalcount: number;
    };
    Comments: {
      issue_comment_count: number;
    };
    Assignees: {
      issue_assignees_count: number;
    };
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  issues?: GoodFirstIssue[];
  timestamp: Date;
}

