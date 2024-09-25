import { CLIENT_ORIGIN } from '~/lib/constants';
import { request as doRequest } from '~/lib/fetch';

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
