import { useStore } from "@nanostores/react";
import { Rocket } from "lucide-react";
import { useState, useCallback } from "react";
import { workbenchStore } from "~/lib/stores/workbench";
import type { DeployResponse, NetlifyUserResponse } from "~/types/netlify";
import { v4 as uuidv4 } from 'uuid';
import type { FileMap } from "~/lib/stores/files";
import { toast } from "react-toastify";
import { WORK_DIR } from "~/utils/constants";

export function Deploy() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'built'>('idle');
  const files = useStore(workbenchStore.files) as FileMap;
  const { firstArtifact } = workbenchStore;

  const getDistFolder = async () => {
    let url: string | undefined;
    const webcontainer = await workbenchStore.getWebContainer();
    if (!webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const data = await webcontainer.export(WORK_DIR, { 
        format: 'zip',
        includes: [
          '**/dist/**/*' 
        ],
        excludes: [
          '**/node_modules/**',
        ]
      });

      console.log('Export successful, data size:', data);
      
      const zip = new Blob([data], { type: 'application/zip' });
      
      return zip;
    } catch (error) {
      console.error('Error exporting dist folder:', error);
      throw error;
    }
  };

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true);
    try {
      const userResponse = await fetch('/api/netlify');
      const userData = await userResponse.json() as NetlifyUserResponse;
      
      if (!userData.user) {
        throw new Error('Please connect your Netlify account first');
      }

      setBuildStatus('building');
      const messageId = uuidv4();
      const artifactId = messageId;

      const webcontainer = await workbenchStore.getWebContainer();
      if (!webcontainer) {
        throw new Error('WebContainer not initialized');
      }

      workbenchStore.addArtifact({
        messageId,
        id: artifactId,
        title: 'Deploy to Netlify',
      });

      const cdAction = {
        messageId,
        artifactId,
        actionId: uuidv4(),
        action: {
          type: 'shell' as const,
          content: `cd ${WORK_DIR}`,
        }
      };

      console.log('Changing to project directory...');
      workbenchStore.addAction(cdAction);
      await workbenchStore.runAction(cdAction);

      const installActionId = uuidv4();
      const installAction = {
        messageId,
        artifactId,
        actionId: installActionId,
        action: {
          type: 'shell' as const,
          content: 'npm install',
        }
      };

      console.log('Installing dependencies...');
      workbenchStore.addAction(installAction);
      await workbenchStore.runAction(installAction);

      const buildActionId = uuidv4();
      const buildAction = {
        messageId,
        artifactId,
        actionId: buildActionId,
        action: {
          type: 'shell' as const,
          content: 'npm run build',
        }
      };

      console.log('Running build command...');
      workbenchStore.addAction(buildAction);
      await workbenchStore.runAction(buildAction);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const artifact = workbenchStore.artifacts.get()[artifactId];
      if (!artifact) {
        throw new Error('Build artifact not found');
      }

      const actions = artifact.runner.actions.get();
      const buildActionState = actions[buildActionId];
      
      if (buildActionState.status === 'failed') {
        console.error('Build output:', buildActionState.error);
        throw new Error(`Build failed: ${buildActionState.error}`);
      }

      const distFiles = await getDistFolder();
      console.log('Built dist files:', distFiles);
      
      if (!distFiles || distFiles.size === 0) {
        throw new Error('Build completed but no dist folder found');
      }

      workbenchStore.updateArtifact({
        messageId,
        id: artifactId,
        title: 'Deploy to Netlify'
      }, { 
        closed: true 
      });

      setBuildStatus('built');

      const response = await fetch('/api/netlify?action=deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/zip',
          'X-Artifact-ID': firstArtifact?.id || `bolt-${Date.now()}`
        },
        body: distFiles
      });

      const data = await response.json() as DeployResponse;

      if (!data.success) {
        throw new Error(data.error || 'Deployment failed');
      }

      if (data.deployUrl) {
        setDeployUrl(data.deployUrl);
        toast.success('Deployment successful!');
      }

    } catch (error) {
      console.error('Deployment error:', error);
      toast.error(error instanceof Error ? error.message : 'Deployment failed');
    } finally {
      setIsDeploying(false);
      setBuildStatus('idle');
    }
  }, [files]);

  return (
    <div className="flex items-center gap-2">
      {deployUrl ? (
        <button
          onClick={() => window.open(deployUrl, '_blank')}
          className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-bolt-elements-button-secondary-text text-xs border border-bolt-elements-borderColor rounded-md"
        >
          <Rocket className="w-4 h-4" />
          View Deployment
        </button>
      ) : (
        <button
          onClick={handleDeploy}
          disabled={isDeploying || buildStatus === 'building'}
          className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 ${
            isDeploying || buildStatus === 'building'
              ? 'bg-[#0E6EE8]/70 cursor-not-allowed' 
              : 'bg-[#0E6EE8] hover:bg-[#1477f9]'
          } text-bolt-elements-button-secondary-text text-xs border border-bolt-elements-borderColor rounded-md`}
        >
          <Rocket className={`w-4 h-4 ${isDeploying || buildStatus === 'building' ? 'animate-pulse' : ''}`} />
          {isDeploying ? 'Deploying...' : buildStatus === 'building' ? 'Building...' : 'Deploy'}
        </button>
      )}
    </div>
  );
}
