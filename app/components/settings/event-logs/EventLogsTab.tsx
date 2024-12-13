import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSettings } from '~/lib/hooks/useSettings';
import { toast } from 'react-toastify';
import { Switch } from '~/components/ui/Switch';
import { logStore, type LogEntry } from '~/lib/stores/logs';

export default function EventLogsTab() {
  const {} = useSettings();
  const [logLevel, setLogLevel] = useState<LogEntry['level']>('info');
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Add some initial logs for testing
    logStore.logSystem('System started', { version: '1.0.0' });
    logStore.logWarning('High memory usage detected', { memoryUsage: '85%' });
    logStore.logError('Failed to connect to provider', new Error('Connection timeout'), { provider: 'OpenAI' });
  }, []);

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

  const filteredLogs = useMemo(() => {
    return logStore.getFilteredLogs(logLevel, undefined, searchQuery);
  }, [logLevel, searchQuery]);

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
    <div className="p-4">
      <div className="flex flex-col space-y-4 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-bolt-elements-textPrimary">Event Logs</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-bolt-elements-textSecondary">Auto-scroll</span>
            <Switch checked={autoScroll} onCheckedChange={setAutoScroll} />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value as LogEntry['level'])}
            className="bg-bolt-elements-bg-depth-2 text-bolt-elements-textPrimary rounded-lg px-3 py-1.5 text-sm min-w-[100px]"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-bolt-elements-bg-depth-2 text-bolt-elements-textPrimary rounded-lg px-3 py-1.5 text-sm flex-1"
          />
          <button
            onClick={handleExportLogs}
            className="bg-blue-500 text-white rounded-lg px-3 py-1.5 hover:bg-blue-600 transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Export Logs
          </button>
          <button
            onClick={handleClearLogs}
            className="bg-red-500 text-white rounded-lg px-3 py-1.5 hover:bg-red-600 transition-colors duration-200 text-sm whitespace-nowrap"
          >
            Clear Logs
          </button>
        </div>
      </div>

      <div className="bg-bolt-elements-bg-depth-1 rounded-lg p-4 h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-bolt-elements-textSecondary py-8">No logs found</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className="text-sm mb-3 font-mono border-b border-bolt-elements-borderColor pb-2 last:border-0"
            >
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`font-bold ${getLevelColor(log.level)}`}>[{log.level.toUpperCase()}]</span>
                <span className="text-bolt-elements-textSecondary">{new Date(log.timestamp).toLocaleString()}</span>
                <span className="text-bolt-elements-textPrimary">{log.message}</span>
              </div>
              {log.details && (
                <pre className="mt-2 text-xs text-bolt-elements-textSecondary overflow-x-auto">
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
