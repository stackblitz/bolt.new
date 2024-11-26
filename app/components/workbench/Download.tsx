import { useCallback, useState } from 'react';
import { workbenchStore } from '~/lib/stores/workbench';
import { toast } from 'react-toastify';
import { WORK_DIR } from '~/utils/constants';
import { LucideDownload } from 'lucide-react';

export default function Download() {
  const [isLoading, setIsLoading] = useState(false);
  const { firstArtifact } = workbenchStore;

  const handleDownload = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    let url: string | undefined;
    
    try {
      const webcontainer = await workbenchStore.getWebContainer();
      if (!webcontainer) {
        throw new Error('WebContainer not initialized');
      }

      const data = await webcontainer.export(WORK_DIR, { 
        format: 'zip',
        excludes: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.cache/**',
          '**/build/**',
          '**/.DS_Store'
        ]
      });
      
      const zip = new Blob([data]);
      
      url = URL.createObjectURL(zip);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${firstArtifact?.id ?? 'project'}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download files: ' + (error as Error).message);
    } finally {
      if (url) {
        URL.revokeObjectURL(url);
      }
      setIsLoading(false);
    }
  }, [isLoading]);
    
  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="flex items-center gap-1 px-3 py-1.5 bg-bolt-elements-code-background hover:bg-gray-700 text-bolt-elements-button-secondary-text text-sm rounded-md"
    >
      {isLoading ? (
        <div className="i-ph:spinner animate-spin" />
      ) : (
        <div className="flex items-center gap-1 text-bolt-elements-button-secondary-text text-xs ">
          <LucideDownload className="w-4 h-4" />
          Download
        </div>
      )}
    </button>
  );
}