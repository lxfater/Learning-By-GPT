import { v4 as uuidv4 } from "uuid";
import ExpiryMap from "expiry-map";
import { createParser } from "eventsource-parser";
import { showNotify } from 'vant';

export async function* streamAsyncIterable(stream) {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

export async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options;
  const resp = await fetch(resource, fetchOptions);
  const parser = createParser((event) => {
    if (event.type === "event") {
      onMessage(event.data);
    }
  });
  for await (const chunk of streamAsyncIterable(resp.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}

const KEY_ACCESS_TOKEN = "accessToken";

const cache = new ExpiryMap(10 * 1000);

export async function getAccessToken() {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN);
  }
  const resp = await fetch("https://chat.openai.com/api/auth/session")
    .then((r) => r.json())
    .catch(() => ({}));
  if (!resp.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
  cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
  return resp.accessToken;
}

export async function getAnswer(question: string, signal?: AbortSignal) {
  const accessToken = await getAccessToken();
  let text = '';
  return new Promise((resolve, reject) => {
    fetchSSE("https://chat.openai.com/backend-api/conversation", {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: uuidv4(),
            role: "user",
            content: {
              content_type: "text",
              parts: [question],
            },
          },
        ],
        model: "text-davinci-002-render-sha",
        parent_message_id: uuidv4(),
      }),
      onMessage(message: string) {
        console.debug("sse message", message);
        if (message === "[DONE]") {
          resolve(text)
          return;
        } else {
          try {
            const data = JSON.parse(message);
            text = data.message?.content?.parts?.[0];
          } catch (error) {
            console.error(error);
          }
        }
      },
    });
  })
}