import type { RoadmapRequest, RoadmapResponse } from "../types/roadmap.types";
import { mockRoadmapResponse } from "../data/roadmapMock";

const USE_MOCK = true;
const API_BASE = import.meta.env.REACT_APP_API_URL ?? "http://localhost:8080/api";
const MOCK_DELAY_MS = 900;

function getAuthToken(): string | null {
  return (
    localStorage.getItem("accessToken") ??
    localStorage.getItem("token") ??
    localStorage.getItem("authToken")
  );
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.message === "string") return body.message;
    if (typeof body?.error === "string") return body.error;
  } catch {
    try {
      const text = await response.text();
      if (text) return text;
    } catch {
      return response.statusText;
    }
  }

  return response.statusText;
}

export async function generateRoadmap(
  payload: RoadmapRequest
): Promise<RoadmapResponse> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
    return {
      ...mockRoadmapResponse,
      data: {
        ...mockRoadmapResponse.data,
        title: payload.focusArea
          ? `${payload.focusArea} DSA Roadmap`
          : mockRoadmapResponse.data.title,
        description: payload.goals
          ? `Generated mock roadmap for: ${payload.goals}`
          : mockRoadmapResponse.data.description,
      },
    };
  }

  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/roadmap`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<RoadmapResponse>;
}
