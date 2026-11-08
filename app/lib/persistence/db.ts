import type { Message } from 'ai';
import { createScopedLogger } from '~/utils/logger';
import type { ChatHistoryItem } from './useChatHistory';

const logger = createScopedLogger('ChatHistory');

// Keep one healthy IndexedDB connection and reopen it after browser-driven closes.
let cachedDatabase: IDBDatabase | undefined;
let openingDatabase: Promise<IDBDatabase | undefined> | undefined;

function isDatabaseUsable(database: IDBDatabase) {
  try {
    const transaction = database.transaction('chats', 'readonly');
    transaction.abort();
    return true;
  } catch {
    return false;
  }
}

function invalidateDatabase(database?: IDBDatabase) {
  if (database && cachedDatabase !== database) {
    return;
  }

  try {
    database?.close();
  } catch {
    // The connection may already be closed.
  }

  cachedDatabase = undefined;
  openingDatabase = undefined;
}

export async function openDatabase(): Promise<IDBDatabase | undefined> {
  if (cachedDatabase) {
    if (isDatabaseUsable(cachedDatabase)) {
      return cachedDatabase;
    }

    invalidateDatabase(cachedDatabase);
  }

  if (openingDatabase) {
    return openingDatabase;
  }

  if (typeof indexedDB === 'undefined') {
    logger.warn('IndexedDB is not available in this browser context.');
    return undefined;
  }

  let pending: Promise<IDBDatabase | undefined>;
  pending = new Promise((resolve) => {
    const request = indexedDB.open('boltHistory', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('chats')) {
        const store = database.createObjectStore('chats', { keyPath: 'id' });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('urlId', 'urlId', { unique: true });
      }
    };

    request.onsuccess = (event: Event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      cachedDatabase = database;

      const handleClosedConnection = () => {
        if (cachedDatabase === database) {
          cachedDatabase = undefined;
          openingDatabase = undefined;
          logger.warn('IndexedDB connection closed; it will be reopened on the next operation.');
        }
      };

      database.onversionchange = () => {
        database.close();
        handleClosedConnection();
      };
      database.addEventListener('close', handleClosedConnection);

      if (openingDatabase === pending) {
        openingDatabase = undefined;
      }

      resolve(database);
    };

    request.onerror = (event: Event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      logger.error('Could not open chat history database:', error);

      if (openingDatabase === pending) {
        openingDatabase = undefined;
      }

      resolve(undefined);
    };

    request.onblocked = () => {
      logger.warn('Chat history database upgrade is blocked by another open tab.');
    };
  });

  openingDatabase = pending;
  return pending;
}

function isClosedDatabaseError(error: unknown) {
  if (error instanceof DOMException && error.name === 'InvalidStateError') {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return /database connection is closing|database connection is closed|idbdatabase.*closed/i.test(message);
}

/**
 * Run one history operation, reopening the browser database once when a tab
 * or browser closes the old connection while the application is still open.
 */
export async function withDatabase<T>(operation: (database: IDBDatabase) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const database = await openDatabase();

    if (!database) {
      throw new Error('Chat history storage is unavailable in this browser.');
    }

    try {
      return await operation(database);
    } catch (error) {
      if (attempt === 1 || !isClosedDatabaseError(error)) {
        throw error;
      }

      logger.warn('Chat history database connection closed during an operation; reopening and retrying.');
      invalidateDatabase(database);
    }
  }

  throw new Error('Could not restore the chat history database connection.');
}

export async function getAll(db: IDBDatabase): Promise<ChatHistoryItem[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as ChatHistoryItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function setMessages(
  db: IDBDatabase,
  id: string,
  messages: Message[],
  urlId?: string,
  description?: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');

    store.put({
      id,
      messages,
      urlId,
      description,
      timestamp: new Date().toISOString(),
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not save chat history.'));
    transaction.onabort = () => reject(transaction.error || new Error('Chat history save was aborted.'));
  });
}

export async function getMessages(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return (await getMessagesById(db, id)) || (await getMessagesByUrlId(db, id));
}

export async function getMessagesByUrlId(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const index = store.index('urlId');
    const request = index.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

export async function getMessagesById(db: IDBDatabase, id: string): Promise<ChatHistoryItem> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result as ChatHistoryItem);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteById(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readwrite');
    const store = transaction.objectStore('chats');
    const request = store.delete(id);

    request.onsuccess = () => resolve(undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function getNextId(db: IDBDatabase): Promise<string> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const request = store.getAllKeys();

    request.onsuccess = () => {
      const highestId = request.result.reduce((cur, acc) => Math.max(+cur, +acc), 0);
      resolve(String(+highestId + 1));
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getUrlId(db: IDBDatabase, id: string): Promise<string> {
  const idList = await getUrlIds(db);

  if (!idList.includes(id)) {
    return id;
  } else {
    let i = 2;

    while (idList.includes(`${id}-${i}`)) {
      i++;
    }

    return `${id}-${i}`;
  }
}

async function getUrlIds(db: IDBDatabase): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('chats', 'readonly');
    const store = transaction.objectStore('chats');
    const idList: string[] = [];

    const request = store.openCursor();

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;

      if (cursor) {
        idList.push(cursor.value.urlId);
        cursor.continue();
      } else {
        resolve(idList);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
