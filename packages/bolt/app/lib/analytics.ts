import { Analytics, type IdentifyParams, type PageParams, type TrackParams } from '@segment/analytics-node';
import { CLIENT_ORIGIN } from '~/lib/constants';
import { request as doRequest } from '~/lib/fetch';
import { logger } from '~/utils/logger';

export interface Identity {
  userId?: string | null;
  guestId?: string | null;
  segmentWriteKey?: string | null;
  avatar?: string;
}

const MESSAGE_PREFIX = 'Bolt';

export enum AnalyticsTrackEvent {
  MessageSent = `${MESSAGE_PREFIX} Message Sent`,
  MessageComplete = `${MESSAGE_PREFIX} Message Complete`,
  ChatCreated = `${MESSAGE_PREFIX} Chat Created`,
}

export enum AnalyticsAction {
  Identify = 'identify',
  Page = 'page',
  Track = 'track',
}

// we can omit the user ID since it's retrieved from the user's session
type OmitUserId<T> = Omit<T, 'userId'>;

export type AnalyticsEvent =
  | { action: AnalyticsAction.Identify; payload: OmitUserId<IdentifyParams> }
  | { action: AnalyticsAction.Page; payload: OmitUserId<PageParams> }
  | { action: AnalyticsAction.Track; payload: OmitUserId<TrackParams> };

export async function identifyUser(access: string): Promise<Identity | undefined> {
  const response = await doRequest(`${CLIENT_ORIGIN}/api/identify`, {
    method: 'GET',
    headers: { authorization: `Bearer ${access}` },
  });

  const body = await response.json();

  if (!response.ok) {
    return undefined;
  }

  // convert numerical identity values to strings
  const stringified = Object.entries(body).map(([key, value]) => [
    key,
    typeof value === 'number' ? value.toString() : value,
  ]);

  return Object.fromEntries(stringified) as Identity;
}

// send an analytics event from the client
export async function sendAnalyticsEvent(event: AnalyticsEvent) {
  // don't send analytics events when in dev mode
  if (import.meta.env.DEV) {
    return;
  }

  const request = await fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!request.ok) {
    logger.error(`Error handling Segment Analytics action: ${event.action}`);
  }
}

// send an analytics event from the server
export async function sendEventInternal(identity: Identity, { action, payload }: AnalyticsEvent) {
  const { userId, segmentWriteKey: writeKey } = identity;

  if (!userId || !writeKey) {
    logger.warn('Missing user ID or write key when logging analytics');
    return { success: false as const, error: 'missing-data' };
  }

  const analytics = new Analytics({ flushAt: 1, writeKey }).on('error', logger.error);

  try {
    await new Promise((resolve, reject) => {
      if (action === AnalyticsAction.Identify) {
        analytics.identify({ ...payload, userId }, resolve);
      } else if (action === AnalyticsAction.Page) {
        analytics.page({ ...payload, userId }, resolve);
      } else if (action === AnalyticsAction.Track) {
        analytics.track({ ...payload, userId }, resolve);
      } else {
        reject();
      }
    });
  } catch {
    logger.error(`Error handling Segment Analytics action: ${action}`);
    return { success: false as const, error: 'invalid-action' };
  }

  return { success: true as const };
}
