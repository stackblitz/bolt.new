import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSettings } from '~/lib/hooks/useSettings';
import { toast } from 'react-toastify';
import { Switch } from '~/components/ui/Switch';
import { logStore, type LogEntry } from '~/lib/stores/logs';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';

export default function EventLogsTab() {
  const {} = useSettings();
  const showLogs = useStore(logStore.showLogs);
  const [logLevel, setLogLevel] = useState<LogEntry['level'] | 'all'>('info');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState({});

  const filteredLogs = useMemo(() => {
    const logs = logStore.getLogs();
    return logs.filter((log) => {
      const matchesLevel = !logLevel || log.level === logLevel || logLevel === 'all';
      const matchesSearch =
        !searchQuery ||
        log.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details)?.toLowerCase()?.includes(searchQuery?.toLowerCase());

      return matchesLevel && matchesSearch;
    });
  }, [logLevel, searchQuery]);

  // Effect to initialize showLogs
  useEffect(() => {
    logStore.showLogs.set(true);
  }, []);

  useEffect(() => {
    // System info logs
    logStore.logSystem('Application initialized', {
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NODE_ENV,
    });

    // Debug logs for system state
    logStore.logDebug('System configuration loaded', {
      runtime: 'Next.js',
      features: ['AI Chat', 'Event Logging'],
    });

    // Warning logs for potential issues
    logStore.logWarning('Resource usage threshold approaching', {
      memoryUsage: '75%',
      cpuLoad: '60%',
    });

    // Error logs with detailed context
    logStore.logError('API connection failed', new Error('Connection timeout'), {
      endpoint: '/api/chat',
      retryCount: 3,
      lastAttempt: new Date().toISOString(),
    });
  }, []);

  useEffect(() => {
    const container = document.querySelector('.logs-container');

    if (container && autoScroll) {
      container.scrollTop = container.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const handleClearLogs = useCallback(() => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logStore.clearLogs();
      toast.success('Logs cleared successfully');
      forceUpdate({}); // Force a re-render after clearing logs
    }
  }, []);

  const handleExportLogs = useCallback(() => {
    try {
      const logText = logStore
        .getLogs()
        .map(
          (log) =>
            `[${log.level.toUpperCase()}] ${log.timestamp} - ${log.message}${
              log.details ? '\nDetails: ' + JSON.stringify(log.details, null, 2) : ''
            }`,
        )
        .join('\n\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-logs-${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Logs exported successfully');
    } catch (error) {
      toast.error('Failed to export logs');
      console.error('Export error:', error);
    }
  }, []);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-bolt-elements-textPrimary';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex flex-col space-y-4 mb-4">
        {/* Title and Toggles Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary">Event Logs</h3>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-bolt-elements-textSecondary whitespace-nowrap">Show Actions</span>
              <Switch checked={showLogs} onCheckedChange={(checked) => logStore.showLogs.set(checked)} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-bolt-elements-textSecondary whitespace-nowrap">Auto-scroll</span>
              <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value as LogEntry['level'])}
            className="flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all lg:max-w-[20%] text-sm min-w-[100px]"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-bolt-elements-background-depth-4 relative px-2 py-1.5 rounded-md focus:outline-none placeholder-bolt-elements-textTertiary text-bolt-elements-textPrimary dark:text-bolt-elements-textPrimary border border-bolt-elements-borderColor"
            />
          </div>
          {showLogs && (
            <div className="flex items-center gap-2 flex-nowrap">
              <button
                onClick={handleExportLogs}
                className={classNames(
                  'bg-bolt-elements-button-primary-background',
                  'rounded-lg px-4 py-2 transition-colors duration-200',
                  'hover:bg-bolt-elements-button-primary-backgroundHover',
                  'text-bolt-elements-button-primary-text',
                )}
              >
                Export Logs
              </button>
              <button
                onClick={handleClearLogs}
                className={classNames(
                  'bg-bolt-elements-button-danger-background',
                  'rounded-lg px-4 py-2 transition-colors duration-200',
                  'hover:bg-bolt-elements-button-danger-backgroundHover',
                  'text-bolt-elements-button-danger-text',
                )}
              >
                Clear Logs
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-bolt-elements-bg-depth-1 rounded-lg p-4 h-[calc(100vh - 250px)] min-h-[400px] overflow-y-auto logs-container overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-bolt-elements-textSecondary py-8">No logs found</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="text-sm mb-3 font-mono border-b border-bolt-elements-borderColor pb-2 last:border-0"
            >
              <div className="flex items-start space-x-2 flex-wrap">
                <span className={`font-bold ${getLevelColor(log.level)} whitespace-nowrap`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-bolt-elements-textSecondary whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span className="text-bolt-elements-textPrimary break-all">{log.message}</span>
              </div>
              {log.details && (
                <pre className="mt-2 text-xs text-bolt-elements-textSecondary overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
