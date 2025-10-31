export interface GithubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  pushed_at: string;
  default_branch: string;
  owner: {
    login: string;
  };
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GithubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string; // Present when fetching a file
  encoding?: 'base64'; // Present when fetching a file
  _links: {
    self: string;
    git: string;
    html: string;
  };
}
