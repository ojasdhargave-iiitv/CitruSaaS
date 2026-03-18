// Flexible WebSocket template (JavaScript)
// Keep this file framework-agnostic so it can be connected to ws, socket.io,
// or any custom transport layer later.

/**
 * @typedef {Object} IncomingMessage
 * @property {string} event
 * @property {any} [payload]
 */

/**
 * @typedef {Object} OutgoingMessage
 * @property {string} event
 * @property {any} [payload]
 * @property {string} [error]
 */

/**
 * @typedef {Object} ConnectionContext
 * @property {string} [userId]
 * @property {string} [role]
 * @property {Record<string, any>} [meta]
 */

/**
 * @typedef {Object} TemplateHooks
 * @property {(client: any, context: ConnectionContext) => (Promise<void>|void)} [onConnect]
 * @property {(client: any, context: ConnectionContext) => (Promise<void>|void)} [onDisconnect]
 * @property {(error: any, client?: any, context?: ConnectionContext) => void} [onError]
 * @property {(message: IncomingMessage, client: any, context: ConnectionContext) => (Promise<void>|void)} [onUnknownEvent]
 */

const safeParse = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const stringify = (message) => JSON.stringify(message);

/**
 * @param {TemplateHooks} [hooks]
 * @param {Record<string, (payload: any, client: any, context: ConnectionContext) => (Promise<void>|void)>} [initialHandlers]
 */
const createWebSocketTemplate = (hooks = {}, initialHandlers = {}) => {
  const handlers = new Map(Object.entries(initialHandlers));

  const emit = (client, message) => {
    client.send(stringify(message));
  };

  const register = (event, handler) => {
    handlers.set(event, handler);
  };

  const unregister = (event) => {
    handlers.delete(event);
  };

  const getRegisteredEvents = () => [...handlers.keys()];

  const handleRawMessage = async (raw, client, context) => {
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
      if (hooks.onError) {
        hooks.onError(error, client, context);
      }
      emit(client, { event: 'error', error: 'Handler execution failed.' });
    }
  };

  const broadcast = (clients, message, shouldSend = () => true) => {
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
const authenticateConnection = async (token) => {
  if (!token) {
    return { meta: { anonymous: true } };
  }

  // TODO: Verify JWT/session/token and return derived context.
  // Example: return { userId: decoded.userId, role: decoded.role };
  return { meta: { tokenProvided: true } };
};

module.exports = {
  createWebSocketTemplate,
  authenticateConnection,
};

// Example usage in your real server layer (to wire later):
// 1) create template instance
// 2) register domain events (chat:send, room:join, etc.)
// 3) on socket message -> call handleRawMessage(raw, client, context)
// 4) on connect/disconnect -> invoke hooks.onConnect / hooks.onDisconnect
