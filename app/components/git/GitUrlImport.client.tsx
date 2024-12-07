import { useSearchParams } from '@remix-run/react';
import { generateId, type Message } from 'ai';
import ignore from 'ignore';
import { useEffect, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { useGit } from '~/lib/hooks/useGit';
import { useChatHistory } from '~/lib/persistence';

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  '.github/**',
  '.vscode/**',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.png',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
  '**/*lock.json',
  '**/*lock.yaml',
];

export function GitUrlImport() {
  const [searchParams] = useSearchParams();
  const { ready: historyReady, importChat } = useChatHistory();
  const { ready: gitReady, gitClone } = useGit();
  const [imported, setImported] = useState(false);

  const importRepo = async (repoUrl?: string) => {
    if (!gitReady && !historyReady) {
      return;
    }

    if (repoUrl) {
      const ig = ignore().add(IGNORE_PATTERNS);
      const { workdir, data } = await gitClone(repoUrl);

      if (importChat) {
        const filePaths = Object.keys(data).filter((filePath) => !ig.ignores(filePath));
        console.log(filePaths);

        const textDecoder = new TextDecoder('utf-8');
        const message: Message = {
          role: 'assistant',
          content: `Cloning the repo ${repoUrl} into ${workdir}
<boltArtifact id="imported-files" title="Git Cloned Files" type="bundled" >           
          ${filePaths
            .map((filePath) => {
              const { data: content, encoding } = data[filePath];

              if (encoding === 'utf8') {
                return `<boltAction type="file" filePath="${filePath}">
${content}
</boltAction>`;
              } else if (content instanceof Uint8Array) {
                return `<boltAction type="file" filePath="${filePath}">
${textDecoder.decode(content)}
</boltAction>`;
              } else {
                return '';
              }
            })
            .join('\n')}
 </boltArtifact>`,
          id: generateId(),
          createdAt: new Date(),
        };
        console.log(JSON.stringify(message));

        importChat(`Git Project:${repoUrl.split('/').slice(-1)[0]}`, [message]);

        // console.log(files);
      }
    }
  };

  useEffect(() => {
    if (!historyReady || !gitReady || imported) {
      return;
    }

    const url = searchParams.get('url');

    if (!url) {
      window.location.href = '/';
      return;
    }

    importRepo(url);
    setImported(true);
  }, [searchParams, historyReady, gitReady, imported]);

  return <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>;
}
