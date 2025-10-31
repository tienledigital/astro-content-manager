export interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  thumbnailUrl: string | null;
  body: string;
}

// A more robust frontmatter parser that handles simple nested objects and lists.
const parseFrontmatter = (frontmatterString: string): Record<string, any> => {
  const metadata: Record<string, any> = {};
  const lines = frontmatterString.split('\n');
  let currentKey: string | null = null;
  let isListContext = false;

  for (const line of lines) {
    if (line.trim() === '') continue;

    const indent = line.length - line.trimStart().length;
    const trimmedLine = line.trim();

    if (indent === 0) { // Top-level key
      isListContext = false;
      const separatorIndex = trimmedLine.indexOf(':');
      if (separatorIndex === -1) continue;

      const key = trimmedLine.substring(0, separatorIndex).trim();
      const value = trimmedLine.substring(separatorIndex + 1).trim();
      currentKey = key;

      if (value) { // Value on the same line
        if (value.startsWith('[') && value.endsWith(']')) {
          metadata[key] = value.substring(1, value.length - 1).split(',').map(item => item.trim().replace(/^['"]|['"]$/g, ''));
        } else {
          metadata[key] = value.replace(/^['"]|['"]$/g, '');
        }
      } else { // Block context (list or object)
        metadata[key] = {}; // Assume object, might become list
        isListContext = true;
      }
    } else { // Indented line
      if (currentKey && isListContext) {
        if (trimmedLine.startsWith('- ')) { // It's a list item
          // Convert from object to list on first list item
          if (typeof metadata[currentKey] === 'object' && !Array.isArray(metadata[currentKey]) && Object.keys(metadata[currentKey]).length === 0) {
            metadata[currentKey] = [];
          }
          if (Array.isArray(metadata[currentKey])) {
            metadata[currentKey].push(trimmedLine.substring(2).trim().replace(/^['"]|['"]$/g, ''));
          }
        } else { // It's a nested object property
          const separatorIndex = trimmedLine.indexOf(':');
          if (separatorIndex > -1 && typeof metadata[currentKey] === 'object' && !Array.isArray(metadata[currentKey])) {
            const nestedKey = trimmedLine.substring(0, separatorIndex).trim();
            const nestedValue = trimmedLine.substring(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            (metadata[currentKey] as Record<string, any>)[nestedKey] = nestedValue;
          }
        }
      }
    }
  }
  return metadata;
};


// Find first image in markdown body
const findThumbnailInBody = (body: string): string | null => {
  const imageRegex = /!\[.*?\]\((.*?)\)/;
  const match = body.match(imageRegex);
  return match ? match[1] : null;
};

export const parseMarkdown = (content: string): ParsedMarkdown => {
  const frontmatterRegex = /^---([\s\S]*?)---/;
  const match = content.match(frontmatterRegex);

  let frontmatter: Record<string, any> = {};
  let body = content;

  if (match) {
    frontmatter = parseFrontmatter(match[1]);
    body = content.substring(match[0].length).trim();
  }
  
  // Create a case-insensitive lookup object for frontmatter
  const fmLower = Object.fromEntries(Object.entries(frontmatter).map(([k, v]) => [k.toLowerCase(), v]));

  // Prioritize frontmatter keys for the thumbnail
  const thumbnailFromFm = fmLower['image'] || fmLower['thumbnail'] || fmLower['cover'] || null;

  const thumbnailUrl = thumbnailFromFm || findThumbnailInBody(body);

  return { frontmatter, thumbnailUrl, body };
};

export const updateFrontmatter = (content: string, updates: Record<string, any>): string => {
  const { frontmatter } = parseMarkdown(content);
  const newFrontmatter = { ...frontmatter, ...updates };

  let fmString = '---\n';
  for (const [key, value] of Object.entries(newFrontmatter)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      fmString += `${key}:\n`;
      value.forEach(item => {
        fmString += `  - ${item}\n`;
      });
    } else if (typeof value === 'object' && value !== null) {
      fmString += `${key}:\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
          fmString += `  ${subKey}: ${JSON.stringify(subValue)}\n`;
      }
    }
    else {
      fmString += `${key}: ${JSON.stringify(value)}\n`;
    }
  }
  fmString += '---\n';

  const frontmatterRegex = /^---([\s\S]*?)---/;
  const match = content.match(frontmatterRegex);

  if (match) {
    // Replace existing frontmatter block
    return content.replace(match[0], fmString.trim());
  } else {
    // Prepend new frontmatter block
    return `${fmString}\n${content}`;
  }
};

export const slugify = (str: string): string => {
  return str
    .toString()
    .normalize('NFD') // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-'); // replace multiple - with single -
};


export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'github.com') {
            return null;
        }
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length >= 2) {
            return { owner: pathParts[0], repo: pathParts[1].replace('.git', '') };
        }
        return null;
    } catch(e) {
        return null; // Invalid URL
    }
}

export const inferFrontmatterType = (value: any): string => {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    if (typeof value === 'string' && !isNaN(new Date(value).getTime())) return 'date';
    return 'string';
};

/**
 * Escapes characters in a string that have special meaning in a regular expression.
 * @param str The input string.
 * @returns The escaped string, safe to use in a RegExp.
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
