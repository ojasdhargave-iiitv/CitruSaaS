// Flexible WebSocket template (TypeScript)
// Keep this file framework-agnostic so it can be connected to ws, socket.io,
// or any custom transport layer later.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface IncomingMessage {
  event: string;
  payload?: JsonValue;
}

export interface OutgoingMessage {
  event: string;
  payload?: JsonValue;
  error?: string;
}

export interface ClientLike {
  id?: string;
  send: (data: string) => void;
  close?: (code?: number, reason?: string) => void;
  [key: string]: unknown;
}

export interface ConnectionContext {
  userId?: string;
  role?: string;
  meta?: Record<string, unknown>;
}

export interface TemplateHooks {
  onConnect?: (client: ClientLike, context: ConnectionContext) => Promise<void> | void;
  onDisconnect?: (client: ClientLike, context: ConnectionContext) => Promise<void> | void;
  onError?: (error: unknown, client?: ClientLike, context?: ConnectionContext) => void;
  onUnknownEvent?: (
    message: IncomingMessage,
    client: ClientLike,
    context: ConnectionContext
  ) => Promise<void> | void;
}

export type EventHandler = (
  payload: JsonValue | undefined,
  client: ClientLike,
  context: ConnectionContext
) => Promise<void> | void;

export interface WebSocketTemplate {
  register: (event: string, handler: EventHandler) => void;
  unregister: (event: string) => void;
  getRegisteredEvents: () => string[];
  handleRawMessage: (raw: string, client: ClientLike, context: ConnectionContext) => Promise<void>;
  emit: (client: ClientLike, message: OutgoingMessage) => void;
  broadcast: (
    clients: Iterable<ClientLike>,
    message: OutgoingMessage,
    shouldSend?: (client: ClientLike) => boolean
  ) => void;
}

const safeParse = (raw: string): IncomingMessage | null => {
  try {
    return JSON.parse(raw) as IncomingMessage;
  } catch {
    return null;
  }
};

const stringify = (message: OutgoingMessage): string => JSON.stringify(message);

export const createWebSocketTemplate = (
  hooks: TemplateHooks = {},
  initialHandlers: Record<string, EventHandler> = {}
): WebSocketTemplate => {
  const handlers = new Map<string, EventHandler>(Object.entries(initialHandlers));

  const emit = (client: ClientLike, message: OutgoingMessage): void => {
    client.send(stringify(message));
  };

  const register = (event: string, handler: EventHandler): void => {
    handlers.set(event, handler);
  };

  const unregister = (event: string): void => {
    handlers.delete(event);
  };

  const getRegisteredEvents = (): string[] => [...handlers.keys()];

  const handleRawMessage = async (
    raw: string,
    client: ClientLike,
    context: ConnectionContext
  ): Promise<void> => {
    const parsed = safeParse(raw);

    if (!parsed || !parsed.event) {
      emit(client, { event: 'error', error: 'Invalid message format. Expected JSON with an event field.' });
      return;
    }

    const handler = handlers.get(parsed.event);
    if (!handler) {
      if (hooks.onUnknownEvent) {
        await hooks.onUnknownEvent(parsed, client, context);
        return;
      }

      emit(client, { event: 'error', error: `Unknown event: ${parsed.event}` });
      return;
    }

    try {
      await handler(parsed.payload, client, context);
    } catch (error) {
      hooks.onError?.(error, client, context);
      emit(client, { event: 'error', error: 'Handler execution failed.' });
    }
  };

  const broadcast = (
    clients: Iterable<ClientLike>,
    message: OutgoingMessage,
    shouldSend: (client: ClientLike) => boolean = () => true
  ): void => {
    const encoded = stringify(message);
    for (const client of clients) {
      if (shouldSend(client)) {
        client.send(encoded);
      }
    }
  };

  return {
    register,
    unregister,
    getRegisteredEvents,
    handleRawMessage,
    emit,
    broadcast,
  };
};

// Optional helper for future auth integration. Replace this with your own logic.
export const authenticateConnection = async (
  token: string | undefined
): Promise<ConnectionContext> => {
  if (!token) {
    return { meta: { anonymous: true } };
  }

  // TODO: Verify JWT/session/token and return derived context.
  // Example: return { userId: decoded.userId, role: decoded.role };
  return { meta: { tokenProvided: true } };
};

// Example usage in your real server layer (to wire later):
// 1) create template instance
// 2) register domain events (chat:send, room:join, etc.)
// 3) on socket message -> call handleRawMessage(raw, client, context)
// 4) on connect/disconnect -> invoke hooks.onConnect / hooks.onDisconnect
