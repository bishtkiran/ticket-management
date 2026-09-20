const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  cancelledAt: string | null;
}

export interface TicketListResponse {
  items: Ticket[];
  page: number;
  size: number;
  totalElements: number;
}

export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  createdAt: string;
  createdBy: string | null;
}

export interface TicketCreateRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  assignee?: string;
}

export interface TicketUpdateRequest {
  title?: string;
  description?: string;
  priority?: TicketPriority;
  assignee?: string;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: ApiFieldError[];
  };
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiFieldError[];

  constructor(status: number, response: ApiErrorResponse | undefined) {
    super(response?.error.message ?? 'The request could not be completed.');
    this.name = 'ApiClientError';
    this.status = status;
    this.code = response?.error.code ?? 'REQUEST_FAILED';
    this.details = response?.error.details ?? [];
  }
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorResponse: ApiErrorResponse | undefined;
    try {
      errorResponse = await response.json() as ApiErrorResponse;
    } catch {
      errorResponse = undefined;
    }
    throw new ApiClientError(response.status, errorResponse);
  }

  return response.json() as Promise<T>;
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export function listTickets(params: {
  keyword?: string;
  status?: TicketStatus;
  page?: number;
  size?: number;
} = {}): Promise<TicketListResponse> {
  return requestJson<TicketListResponse>(`/tickets${toQueryString(params)}`);
}

export function getTicket(id: number): Promise<Ticket> {
  return requestJson<Ticket>(`/tickets/${id}`);
}

export function createTicket(request: TicketCreateRequest): Promise<Ticket> {
  return requestJson<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateTicket(id: number, request: TicketUpdateRequest): Promise<Ticket> {
  return requestJson<Ticket>(`/tickets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export function updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
  return requestJson<Ticket>(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function addComment(id: number, content: string): Promise<Comment> {
  return requestJson<Comment>(`/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
