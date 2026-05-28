import type { ExtensionMessage, MessageType } from '../shared/types/ingredients';

// ─── Handler Type ────────────────────────────────────────────────
export type MessageHandler = (
  message: ExtensionMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void
) => void | boolean | Promise<void>;

// ─── Handler Map ─────────────────────────────────────────────────
type HandlerMap = Partial<Record<MessageType, MessageHandler>>;

/**
 * Create a typed message router for chrome.runtime.onMessage.
 *
 * Each handler receives the full message, the sender, and sendResponse.
 * Handlers may return `true` (or the router returns it on their behalf)
 * to signal that sendResponse will be called asynchronously.
 */
export function createMessageRouter(handlers: HandlerMap): void {
  chrome.runtime.onMessage.addListener(
    (
      message: ExtensionMessage,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ): boolean => {
      const { type } = message;

      if (!type) {
        console.warn('[IW] Received message without type:', message);
        return false;
      }

      const handler = handlers[type];

      if (!handler) {
        console.warn(`[IW] No handler registered for message type: ${type}`);
        return false;
      }

      try {
        const result = handler(message, sender, sendResponse);

        // If handler returns a promise, handle it and keep the channel open
        if (result instanceof Promise) {
          result.catch((err) => {
            console.error(`[IW] Async handler error for ${type}:`, err);
            sendResponse({ error: String(err) });
          });
          return true; // Keep message channel open for async response
        }

        // If handler explicitly returns true, keep channel open
        if (result === true) {
          return true;
        }
      } catch (err) {
        console.error(`[IW] Handler error for ${type}:`, err);
        sendResponse({ error: String(err) });
      }

      // Default: channel closes after synchronous return
      return true;
    }
  );
}
