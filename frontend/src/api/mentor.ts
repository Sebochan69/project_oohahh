import type { MentorRequest, MentorResponse } from '../types/mentor';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export async function requestMentorResponse(request: MentorRequest): Promise<MentorResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/mentor/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Mentor request failed with status ${response.status}`);
  }

  return (await response.json()) as MentorResponse;
}
