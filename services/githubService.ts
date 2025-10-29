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

// Helper to correctly base64 encode UTF-8 strings
const base64Encode = (str: string): string => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binary = '';
  const len = data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}


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

  if (response.status === 204 || response.status === 201 || (response.status === 200 && options.method === 'DELETE')) {
    // For successful PUT/DELETE requests that may not have a body
    return response.json().catch(() => ({} as T));
  }
  
  return response.json();
};

export const verifyToken = (token: string): Promise<GithubUser> => {
  return makeRequest<GithubUser>('/user', token);
};

export const getRepoDetails = (token: string, owner: string, repo: string): Promise<GithubRepo> => {
  return makeRequest<GithubRepo>(`/repos/${owner}/${repo}`, token);
};

export const getRepoContents = (
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<GithubContent[]> => {
  return makeRequest<GithubContent[]>(`/repos/${owner}/${repo}/contents/${path}`, token);
};

export const getFileContent = async (
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<string> => {
  const fileData = await makeRequest<GithubContent>(`/repos/${owner}/${repo}/contents/${path}`, token);
  if (fileData.content && fileData.encoding === 'base64') {
    // Decode from Base64 to a Uint8Array
    const binaryString = atob(fileData.content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // Use TextDecoder to interpret the bytes as a UTF-8 string
    return new TextDecoder('utf-8').decode(bytes);
  }
  throw new Error('Could not decode file content.');
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

export const createFileFromString = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  newContent: string,
  commitMessage: string
): Promise<any> => {
  const sha = await getFileSha(token, owner, repo, path);
  if (sha) {
    throw new Error(`A file with the name '${path.split('/').pop()}' already exists in this directory.`);
  }

  const content = base64Encode(newContent);
  const body = {
    message: commitMessage,
    content: content,
  };

  return makeRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const updateFileContent = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  newContent: string,
  commitMessage: string,
  sha: string
): Promise<any> => {
  const content = base64Encode(newContent);
  
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

export const deleteFile = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  commitMessage: string
): Promise<any> => {
  const body = {
    message: commitMessage,
    sha: sha,
  };

  return makeRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'DELETE',
    body: JSON.stringify(body),
  });
};

export const getFileAsBlob = async (
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<Blob> => {
  const fileData = await makeRequest<GithubContent>(`/repos/${owner}/${repo}/contents/${path}`, token);
  if (fileData.content && fileData.encoding === 'base64') {
    const binaryString = atob(fileData.content);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes]);
  }
  throw new Error(`Could not get file content for path: ${path}`);
};

const ignoredDirs = new Set(['node_modules', '.git', '.github', 'dist', 'build', 'vendor', '.vscode', 'pages', 'page']);

async function scanDirectoryGeneric(
    token: string,
    owner: string,
    repo: string,
    path: string,
    depth: number,
    maxDepth: number,
    foundDirs: Set<string>,
    fileCheck: (filename: string) => boolean
) {
    if (depth >= maxDepth) return;

    try {
        const contents = await getRepoContents(token, owner, repo, path);
        let hasMatchingFile = false;
        const subDirs: GithubContent[] = [];

        for (const item of contents) {
            if (item.type === 'file' && fileCheck(item.name)) {
                hasMatchingFile = true;
            } else if (item.type === 'dir' && !ignoredDirs.has(item.name.toLowerCase())) {
                subDirs.push(item);
            }
        }

        if (hasMatchingFile && path) { // Only add if it's not the root directory
            foundDirs.add(path);
        }

        // Recursively scan subdirectories in parallel
        await Promise.all(
            subDirs.map(dir => scanDirectoryGeneric(token, owner, repo, dir.path, depth + 1, maxDepth, foundDirs, fileCheck))
        );

    } catch (error) {
        console.warn(`Could not scan directory '${path}':`, error);
    }
}

const sortPaths = (paths: string[], preferredNames: string[]): string[] => {
    const results = Array.from(paths);
    
    results.sort((a, b) => {
        const aLastName = a.split('/').pop()?.toLowerCase() || '';
        const bLastName = b.split('/').pop()?.toLowerCase() || '';

        const aIsPreferred = preferredNames.includes(aLastName);
        const bIsPreferred = preferredNames.includes(bLastName);

        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
        
        const aDepth = a.split('/').length;
        const bDepth = b.split('/').length;
        if (aDepth !== bDepth) {
            return aDepth - bDepth;
        }

        return a.localeCompare(b);
    });
    
    return results;
}

export const scanForContentDirectories = async (
  token: string,
  owner: string,
  repo: string,
): Promise<string[]> => {
    const foundDirs = new Set<string>();
    await scanDirectoryGeneric(
      token, owner, repo, '', 0, 4, foundDirs,
      (name) => name.endsWith('.md') || name.endsWith('.mdx')
    );
    
    const preferredDirNames = ['posts', 'post', 'blog', 'content', 'data', 'articles'];
    return sortPaths(Array.from(foundDirs), preferredDirNames);
}

export const scanForImageDirectories = async (
  token: string,
  owner: string,
  repo: string,
): Promise<string[]> => {
    const foundDirs = new Set<string>();
    await scanDirectoryGeneric(
      token, owner, repo, '', 0, 4, foundDirs,
      (name) => /\.(jpe?g|png|gif|webp|svg)$/i.test(name)
    );
    
    const preferredDirNames = ['images', 'assets', 'static', 'public'];
    const sorted = sortPaths(Array.from(foundDirs), preferredDirNames);

    // Give special priority to 'public/images'
    const publicImagesIndex = sorted.findIndex(p => p.toLowerCase() === 'public/images');
    if (publicImagesIndex > 0) {
        const [publicImagesPath] = sorted.splice(publicImagesIndex, 1);
        sorted.unshift(publicImagesPath);
    }

    return sorted;
}

export const findProductionUrl = async (
  token: string,
  owner: string,
  repo: string
): Promise<string | null> => {
  // Regex for JS/TS/MJS config files looking for `site: '...'`
  const jsSiteRegex = /site\s*:\s*['"](https?:\/\/[^'"]+)['"]/;
  
  // Regex for YAML files looking for `site: ...` or `url: ...`, allowing for indentation
  const yamlSiteRegex = /^\s*(?:site|url)\s*:\s*['"]?(https?:\/\/[^'"\s]+)['"]?/m; // m for multiline

  const filesToScan = [
    { path: 'astro.config.mjs', regex: jsSiteRegex },
    { path: 'astro.config.ts', regex: jsSiteRegex },
    { path: 'astro.config.js', regex: jsSiteRegex },
    { path: 'src/config.yaml', regex: yamlSiteRegex },
    { path: 'src/config.yml', regex: yamlSiteRegex },
    { path: 'src/config.ts', regex: jsSiteRegex },
    { path: 'src/config.js', regex: jsSiteRegex },
  ];

  for (const file of filesToScan) {
    try {
      const content = await getFileContent(token, owner, repo, file.path);
      const match = content.match(file.regex);
      if (match && match[1]) {
        // Return the first captured group, trimming any trailing slashes for consistency
        return match[1].replace(/\/$/, '');
      }
    } catch (error) {
      // File not found, continue to the next one
    }
  }

  // Fallback to package.json
  try {
    const content = await getFileContent(token, owner, repo, 'package.json');
    const pkg = JSON.parse(content);
    if (pkg.homepage && typeof pkg.homepage === 'string' && pkg.homepage.startsWith('http')) {
      return pkg.homepage.replace(/\/$/, '');
    }
  } catch (error) {
    // package.json not found or parsing failed
  }
  
  return null;
};

export interface RepoTreeItem {
  path: string;
  name: string;
  type: 'dir' | 'file';
  hasMarkdown?: boolean; // For directories, indicates if it contains .md/.mdx files
}

const ignoredTreeDirs = new Set(['node_modules', '.git', '.github', 'dist', 'build', 'vendor', '.vscode']);

export const getRepoTree = async (
  token: string,
  owner: string,
  repo: string,
  path: string = ''
): Promise<RepoTreeItem[]> => {
  const contents = await getRepoContents(token, owner, repo, path);

  const processedItems = await Promise.all(
    contents.map(async (item): Promise<RepoTreeItem | null> => {
      if (ignoredTreeDirs.has(item.name.toLowerCase())) {
        return null;
      }
      if (item.type === 'dir') {
        try {
          // Check if the directory contains markdown files for a visual hint
          const subContents = await getRepoContents(token, owner, repo, item.path);
          const hasMarkdown = subContents.some(subItem =>
            subItem.type === 'file' && (subItem.name.endsWith('.md') || subItem.name.endsWith('.mdx'))
          );
          return { path: item.path, name: item.name, type: 'dir', hasMarkdown };
        } catch (e) {
          // Can happen if directory is empty or inaccessible
          return { path: item.path, name: item.name, type: 'dir', hasMarkdown: false };
        }
      }
      return { path: item.path, name: item.name, type: 'file' };
    })
  );

  const validItems = processedItems.filter((item): item is RepoTreeItem => item !== null);

  // Sort: folders first, then files, then alphabetically
  validItems.sort((a, b) => {
    if (a.type === 'dir' && b.type !== 'dir') return -1;
    if (a.type !== 'dir' && b.type === 'dir') return 1;
    return a.name.localeCompare(b.name);
  });

  return validItems;
};