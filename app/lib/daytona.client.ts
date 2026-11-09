import { atom } from 'nanostores';

export interface DaytonaPreview {
  port: number;
  ready: boolean;
  baseUrl: string;
}

export const remotePreviewStore = atom<DaytonaPreview | undefined>(undefined);

interface DaytonaResponse {
  ok: boolean;
  error?: string;
  output?: string;
  exitCode?: number;
  preview?: DaytonaPreview;
  sandboxState?: string;
}

async function callDaytona(payload: Record<string, unknown>): Promise<DaytonaResponse> {
  const response = await fetch('/api/daytona', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({})) as DaytonaResponse;

  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Daytona request failed (' + response.status + ').');
  }

  if (result.preview) {
    remotePreviewStore.set(result.preview);
  }

  return result;
}

export async function ensureDaytonaSession() {
  return callDaytona({ op: 'status' });
}

export async function writeDaytonaFile(path: string, content: string) {
  return callDaytona({ op: 'file', path, content });
}

export interface DaytonaSyncFile {
  path: string;
  content: string;
}

export async function syncDaytonaFiles(files: DaytonaSyncFile[]) {
  if (files.length === 0) {
    return { ok: true };
  }

  return callDaytona({ op: 'sync', files });
}

export async function executeDaytonaCommand(command: string) {
  return callDaytona({ op: 'command', command });
}

export async function refreshDaytonaPreview(port: number) {
  return callDaytona({ op: 'preview', port });
}
