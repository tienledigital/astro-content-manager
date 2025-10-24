import type { AstroIntegration } from 'astro';
import { simpleGit } from 'simple-git';
import path from 'path';
import { fileURLToPath } from 'url';

const VIRTUAL_MODULE_ID = 'virtual:astro-github-content-manager/config';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

interface ContentManagerOptions {
  route?: string;
}

export default function contentManager(options: ContentManagerOptions = {}): AstroIntegration {
  const { route = '/dashboard' } = options;
  let owner = '';
  let repoName = '';

  return {
    name: 'astro-github-content-manager',
    hooks: {
      'astro:config:setup': async ({ injectRoute, updateConfig }) => {
        
        // 1. Detect GitHub repository from git remote
        try {
          const git = simpleGit();
          const remotes = await git.getRemotes(true);
          const origin = remotes.find(r => r.name === 'origin');
          if (!origin) {
            console.warn('[ContentManager] Could not find "origin" remote. Integration disabled.');
            return;
          }
          
          const match = origin.refs.fetch.match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(\.git)?$/);
          if (!match) {
            console.warn(`[ContentManager] Could not parse GitHub repository from origin URL: ${origin.refs.fetch}. Integration disabled.`);
            return;
          }
          owner = match[1];
          repoName = match[2];
          console.log(`[ContentManager] Detected repository: ${owner}/${repoName}`);
        } catch (e) {
          console.warn('[ContentManager] Not in a git repository or git is not available. Integration disabled.');
          return;
        }

        // 2. Inject the admin route
        const currentDir = path.dirname(fileURLToPath(import.meta.url));
        injectRoute({
          pattern: route,
          entrypoint: path.resolve(currentDir, 'pages/dashboard.astro'),
        });
        
        // 3. Create a Vite plugin for the virtual module
        const vitePlugin = {
          name: 'astro-github-content-manager-virtual-module',
          resolveId(id: string) {
            if (id === VIRTUAL_MODULE_ID) {
              return RESOLVED_VIRTUAL_MODULE_ID;
            }
          },
          load(id: string) {
            if (id === RESOLVED_VIRTUAL_MODULE_ID) {
              return `export const owner = "${owner}"; export const repoName = "${repoName}";`;
            }
          },
        };

        // 4. Update Vite config to include our plugin and dependencies
        updateConfig({
            // @ts-expect-error The `vite` property is a valid top-level key in Astro's config.
            // This error can occur due to type conflicts in the project's dependencies, but the runtime behavior is correct.
            vite: {
                optimizeDeps: {
                    include: ['react-dom/client'],
                },
                plugins: [vitePlugin],
            }
        });
      },
    },
  };
}