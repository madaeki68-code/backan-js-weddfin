import { apiRequest } from './apiClient';

type FeedResponse = {
  active?: boolean;
  url?: string;
  error?: string;
};

async function invokeFeedAction(action: 'status' | 'create' | 'revoke'): Promise<FeedResponse> {
  return apiRequest<FeedResponse>('/calendar/google-feed', {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

export const getGoogleCalendarFeedStatus = () => invokeFeedAction('status');
export const createGoogleCalendarFeed = () => invokeFeedAction('create');
export const revokeGoogleCalendarFeed = () => invokeFeedAction('revoke');
