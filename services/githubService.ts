import { GithubUser, GithubRepo, GithubContent } from '../types';

const API_BASE_URL = 'https://api.github.com';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const makeRequest = async <T,>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
  }

  if (response.status === 204 || response.status === 201) {
    // For successful PUT/DELETE requests that may not have a body
    return response.json().catch(() => ({} as T));
  }
  
  return response.json();
};

export const verifyToken = (token: string): Promise<GithubUser> => {
  return makeRequest<GithubUser>('/user', token);
};

export const getRepoContents = (
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<GithubContent[]> => {
  return makeRequest<GithubContent[]>(`/repos/${owner}/${repo}/contents/${path}`, token);
};

export const getFileSha = async (token: string, owner: string, repo: string, path: string): Promise<string | undefined> => {
  try {
    const fileData = await makeRequest<{ sha: string }>(`/repos/${owner}/${repo}/contents/${path}`, token);
    return fileData.sha;
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return undefined; // File doesn't exist
    }
    throw error;
  }
};

export const uploadFile = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  file: File,
  commitMessage: string
): Promise<any> => {
  const content = await fileToBase64(file);
  const sha = await getFileSha(token, owner, repo, path);

  const body = {
    message: commitMessage,
    content: content,
    sha: sha,
  };

  return makeRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};
