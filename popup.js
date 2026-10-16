
const GROQ_MODEL_LIST = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
  "mootshotai/kimi-k2-instruct",
  "groq/compound-mini",
  "allam-2-7b",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b"
];
let GROQ_MODEL = null;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEMO_CHAT_TRANSCRIPT = `Dimitry: Hey, can we film the product today?
You: Yes, after coding class. We can do close-ups.
Dimitry: Great. I have the Apple Watch and HomePod Mini.
You: Perfect. Bring a different shirt for each setup.
Dimitry: Sounds good. I’ll bring the gear and the props.
You: Awesome. Let’s meet at the Northpark clubhouse at 2:15.
Dimitry: Okay, I’ll see you there.`;

function buildDemoConversationSummary() {
  return {
    action: "summarize",
    participants: [
      {
        username: "Dimitry",
        points: [
          "Plans to film products today",
          "Has and will bring AirPods Pro and iPhone 16 Pro",
          "Will bring 3 different shirts",
          "Agrees to meet at Northpark clubhouse at 2:15"
        ]
      },
      {
        username: "You",
        points: [
          "Agrees to film after coding class",
          "Thought of good ideas for shot types",
          "Wants a different shirt for each shot",
          "Arranges meeting at Northpark clubhouse at 2:15"
        ]
      }
    ]
  };
}

function buildTranscriptDerivedSummary(transcript) {
  const participantMap = new Map();

  (transcript || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (!match) {
        return;
      }

      const speaker = normalizeName(match[1]);
      const message = match[2].trim();
      if (!speaker || !message) {
        return;
      }

      if (!participantMap.has(speaker)) {
        participantMap.set(speaker, []);
      }

      const readableNote = message
        .replace(/\s+/g, " ")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .trim();

      if (readableNote) {
        participantMap.get(speaker).push(readableNote);
      }
    });

  const participants = Array.from(participantMap.entries()).map(([username, points]) => ({
    username,
    points: points.slice(0, 6).map((point) => {
      const trimmed = point.trim();
      if (!trimmed) {
        return "";
      }
      return trimmed.length > 100 ? `${trimmed.slice(0, 97).trim()}...` : trimmed;
    }).filter(Boolean)
  }));

  if (!participants.length) {
    return buildDemoConversationSummary();
  }

  return { action: "summarize", participants };
}

const prompt_request = `You are an AI assistant helping a neurodivergent user understand a chat conversation.
The conversation input is a list of chat messages in plain text, usually in the form "Name: message" or one message per line.
Summarize only the actual chat messages, not UI text.
Ignore buttons, labels, menu items, headers, forms, sidebars, navigation, icons, page chrome, and website elements.
Summarize the conversation into short, concise, literal points under 10 words.
Attribute actions strictly to the account that sent them.
Include emotional tone in brackets, such as [Tone: Neutral] or [Tone: Direct].

STRICT OUTPUT RULES:
- Return ONLY valid JSON parseable by JSON.parse().
- Do not wrap the JSON in markdown fences, do not include prose, comments, or trailing commas.
- Start directly with "{" and end directly with "}".
- The top-level object must contain an "action" field and a "participants" array.

EXPECTED JSON SCHEMA:
{
  "action": "summarize",
  "participants": [
    {
      "username": "string",
      "points": ["string"]
    }
  ]
}`
// ═════════════════════════════════════════════════════════════
// SECTION 1 — TAB SWITCHING
// Already set up. Do not edit.
// ═════════════════════════════════════════════════════════════

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`page-${tab.dataset.tab}`).classList.add("active");
  });
});

document.querySelectorAll(".tabB").forEach(tabB => {
  tabB.addEventListener("click", () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(`page-${tabB.dataset.tab}`).classList.add("active");
  });
});

// ═════════════════════════════════════════════════════════════
// SECTION 2 — API KEY
// Already set up. Do not edit.
// ═════════════════════════════════════════════════════════════

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get("groqApiKey", (result) => {
      resolve(result.groqApiKey || null);
    });
  });
}

async function getGoogleChatAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get("googleChatAccessToken", (result) => {
      resolve(result.googleChatAccessToken || null);
    });
  });
}

document.getElementById("saveKey").addEventListener("click", () => {
  const key = document.getElementById("apiKey").value.trim();
  const statusEl = document.getElementById("key-status");

  if (!key) {
    statusEl.textContent = "No key entered. Please paste your Groq API key.";
    statusEl.className = "status error-text";
    return;
  }

  chrome.storage.local.set({ groqApiKey: key }, () => {
    statusEl.textContent = "API key saved!";
    statusEl.className = "status success";
    document.getElementById("apiKey").value = "";
  });
});

document.getElementById("clearStorageButton").addEventListener("click", async () => {
  const confirmed = window.confirm("Clear all saved contacts and conversation data?");

  if (!confirmed) {
    return;
  }

  chrome.storage.local.remove(OUT_THERE_DATA_KEY, async () => {
    const data = await loadOutThereData();
    renderStoredData(data);

    const statusEl = document.getElementById("key-status");
    if (statusEl) {
      statusEl.textContent = "Saved contacts and conversations cleared.";
      statusEl.className = "status success";
    }
  });
});

document.getElementById("saveGoogleChatToken").addEventListener("click", () => {
  const token = document.getElementById("googleChatToken").value.trim();
  const statusEl = document.getElementById("google-chat-token-status");

  if (!token) {
    statusEl.textContent = "No Google Chat token entered.";
    statusEl.className = "status error-text";
    return;
  }

  chrome.storage.local.set({ googleChatAccessToken: token }, () => {
    statusEl.textContent = "Google Chat token saved.";
    statusEl.className = "status success";
    document.getElementById("googleChatToken").value = "";
  });
});

async function initKeyStatus() {
  const key = await getApiKey();
  const statusEl = document.getElementById("key-status");
  const inputEl = document.getElementById("apiKey");

  if (key) {
    statusEl.textContent = "API key is saved.";
    statusEl.className = "status success";
    inputEl.placeholder = "Key saved — paste a new one to replace it";
  } else {
    statusEl.textContent = "No API key saved yet.";
    statusEl.className = "status error-text";
  }

  const googleToken = await getGoogleChatAccessToken();
  const googleStatusEl = document.getElementById("google-chat-token-status");
  const googleInputEl = document.getElementById("googleChatToken");

  if (googleToken) {
    googleStatusEl.textContent = "Google Chat token is saved.";
    googleStatusEl.className = "status success";
    googleInputEl.placeholder = "Token saved — paste a new one to replace it";
  } else {
    googleStatusEl.textContent = "No Google Chat token saved yet.";
    googleStatusEl.className = "status error-text";
  }
}

const OUT_THERE_DATA_KEY = "outThereData";

function normalizeGoogleChatMessageEntry(message) {
  const text = String(message?.text || "").trim();
  const senderName = String(message?.sender?.displayName || message?.sender?.name || message?.user?.displayName || "Unknown").trim();
  const timestamp = message?.createTime || null;

  if (!text) {
    return null;
  }

  return {
    sender: senderName || "Unknown",
    timestamp,
    text
  };
}

async function getGoogleChatHistory(spaceId, accessToken) {
  if (!spaceId || !String(spaceId).trim()) {
    throw new Error("A Google Chat space ID is required.");
  }

  const normalizedToken = String(accessToken || "").trim();
  if (!normalizedToken) {
    throw new Error("A Google Chat OAuth access token is required.");
  }

  const url = `https://chat.googleapis.com/v1/spaces/${encodeURIComponent(String(spaceId).trim())}/messages?pageSize=100`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${normalizedToken}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Chat API request failed (${response.status}): ${details || "Unknown error"}`);
  }

  const data = await response.json();
  const messages = Array.isArray(data?.messages) ? data.messages : [];

  return messages
    .map((message) => normalizeGoogleChatMessageEntry(message))
    .filter(Boolean);
}

async function processGoogleChatHistory(spaceId, accessToken, sourceUrl = "https://chat.google.com/") {
  const messages = await getGoogleChatHistory(spaceId, accessToken);
  const transcript = messages
    .map((message) => `${message.sender}: ${message.text}`)
    .join("\n");

  const summary = buildTranscriptDerivedSummary(transcript);
  const saved = await updateContactAndConversationSummary(summary, transcript, sourceUrl || "https://chat.google.com/");

  return {
    messages,
    summary,
    saved
  };
}

function normalizeName(name) {
  return String(name || "Unknown Contact").trim();
}

function dedupeList(values) {
  return [...new Set((values || []).filter(Boolean).map(String))];
}

async function loadOutThereData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(OUT_THERE_DATA_KEY, (result) => {
      const saved = result[OUT_THERE_DATA_KEY] || { contacts: {}, conversations: [] };
      resolve({
        contacts: saved.contacts || {},
        conversations: saved.conversations || []
      });
    });
  });
}

async function saveOutThereData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [OUT_THERE_DATA_KEY]: data }, resolve);
  });
}

function inferCurrentContactName(aiResponse, pageText) {
  const participantNames = (aiResponse?.participants || [])
    .map((person) => normalizeName(person.username))
    .filter((name) => name && !/^you|me$/i.test(name));

  if (participantNames.length) {
    return participantNames[0];
  }

  const directMatches = [
    ...(pageText || "").match(/(?:chat with|talking to|messaging|message from|with)\s+([A-Z][A-Za-z'\-.]+)/g) || [],
    ...(pageText || "").match(/(?:^|\s)([A-Z][A-Za-z'\-.]+)\s+(?:said|asked|replied|texted|messaged)/g) || []
  ];

  const fallbackName = directMatches
    .map((match) => match.replace(/^(?:chat with|talking to|messaging|message from|with)\s+/i, "").replace(/\s+(?:said|asked|replied|texted|messaged).*$/i, ""))
    .map((name) => name.trim())
    .find((name) => name && !/^you$/i.test(name));

  return fallbackName || "Unknown Contact";
}

function createContactRecord(name) {
  return {
    name,
    platforms: [],
    description: "Updated from current conversation",
    youShared: [],
    themShared: [],
    lastUpdated: "Sep 16, 1:32 PM"
  };
}

function buildParticipantGroups(participants) {
  return (participants || [])
    .map((person) => ({
      username: normalizeName(person.username),
      points: Array.isArray(person.points) ? person.points : []
    }))
    .filter((person) => person.username && person.points.length);
}

function updateContactRecord(contact, aiResponse, targetName = null) {
  const participantEntries = (aiResponse?.participants || []).map((person) => ({
    username: normalizeName(person.username),
    points: Array.isArray(person.points) ? person.points : []
  }));

  const resolvedName = normalizeName(targetName || contact.name || inferCurrentContactName(aiResponse, ""));
  const yourPoints = participantEntries
    .filter((person) => /^you$/i.test(person.username))
    .flatMap((person) => person.points);

  const targetPoints = participantEntries
    .filter((person) => normalizeName(person.username) === resolvedName)
    .flatMap((person) => person.points);

  contact.youShared = dedupeList([...(contact.youShared || []), ...yourPoints]);
  contact.themShared = dedupeList([...(contact.themShared || []), ...targetPoints]);
  contact.lastUpdated = "Sep 16, 1:32 PM";

  if (targetPoints.length) {
    contact.description = targetPoints.slice(0, 2).join(" • ");
  } else if (yourPoints.length) {
    contact.description = yourPoints.slice(0, 2).join(" • ");
  }

  return contact;
}

function normalizeConversationNotes(conversation) {
  const rawNotes = Array.isArray(conversation?.notes) ? conversation.notes : [];

  if (!rawNotes.length) {
    return [];
  }

  if (typeof rawNotes[0] === "string") {
    return rawNotes
      .map((note) => {
        const idx = note.indexOf(":");
        if (idx === -1) {
          return { username: "General", points: [note] };
        }
        return {
          username: normalizeName(note.slice(0, idx)),
          points: [note.slice(idx + 1).trim()].filter(Boolean)
        };
      })
      .filter((entry) => entry.username);
  }

  return rawNotes
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      username: normalizeName(entry.username || "General"),
      points: Array.isArray(entry.points) ? entry.points : [String(entry.point || entry.summary || "")].filter(Boolean)
    }))
    .filter((entry) => entry.username && entry.points.length);
}

function upsertConversationRecord(data, aiResponse, personName, sourceUrl) {
  const participantGroups = buildParticipantGroups(aiResponse?.participants || []);

  const title = personName || "Current conversation";
  const existing = data.conversations.find((conversation) => conversation.title === title);
  const platform = sourceUrl ? new URL(sourceUrl).hostname.replace(/^www\./, "") : "Current chat";

  const fixedTimestamp = "Sep 16, 1:32 PM";

  const nextEntry = existing || {
    title,
    date: fixedTimestamp,
    platform,
    people: [],
    notes: []
  };

  const mergedGroups = new Map();
  normalizeConversationNotes(nextEntry).forEach((entry) => {
    mergedGroups.set(entry.username, dedupeList([...(mergedGroups.get(entry.username) || []), ...entry.points]));
  });

  participantGroups.forEach((entry) => {
    mergedGroups.set(entry.username, dedupeList([...(mergedGroups.get(entry.username) || []), ...entry.points]));
  });

  nextEntry.people = dedupeList([
    ...(nextEntry.people || []),
    ...((aiResponse?.participants || []).map((person) => normalizeName(person.username)))
  ]);

  nextEntry.notes = Array.from(mergedGroups.entries()).map(([username, points]) => ({ username, points }));
  nextEntry.date = fixedTimestamp;
  nextEntry.platform = platform;

  if (existing) {
    data.conversations = data.conversations.map((conversation) => conversation.title === title ? nextEntry : conversation);
  } else {
    data.conversations = [nextEntry, ...data.conversations];
  }

  return nextEntry;
}

function renderContactDetailPages(data) {
  const contacts = Object.values(data.contacts || {});
  const pageIds = ["page-tab2.1", "page-tab2.2", "page-tab2.3"];

  pageIds.forEach((pageId, index) => {
    const page = document.getElementById(pageId);
    if (!page) {
      return;
    }

    const contact = contacts[index] || null;

    if (!contact) {
      page.innerHTML = `
        <div class="content-area">
          <div class="fonttitle">No contact saved</div>
          <div class="fontsmallbody">Run the AI summary to save contact notes.</div>
        </div>
      `;
      return;
    }

    const youSection = (contact.youShared || []).length
      ? `<div style="margin-bottom: 12px;"><div class="fontsection">YOU SHARED:</div><ul class="pushinmore">${(contact.youShared || []).map((item) => `<li class="fontsmallbody">${item}</li>`).join("")}</ul></div>`
      : `<div style="margin-bottom: 12px;"><div class="fontsection">YOU SHARED:</div><ul class="pushinmore"><li class="fontsmallbody">No notes yet</li></ul></div>`;

    const themSection = (contact.themShared || []).length
      ? `<div><div class="fontsection">${contact.name.toUpperCase()} SHARED:</div><ul class="pushinmore">${(contact.themShared || []).map((item) => `<li class="fontsmallbody">${item}</li>`).join("")}</ul></div>`
      : `<div><div class="fontsection">${contact.name.toUpperCase()} SHARED:</div><ul class="pushinmore"><li class="fontsmallbody">No notes yet</li></ul></div>`;

    page.innerHTML = `
      <div class="content-area">
        <div class="fonttitle">${contact.name}</div>
        <div class="fontsmallbody">${contact.description || "Updated from current conversation"}</div>
        <div class="content-area-tabB">
          ${youSection}
          <hr>
          ${themSection}
        </div>
      </div>
    `;
  });
}

function renderConversationDetailPages(data) {
  const conversations = data.conversations || [];
  const pageIds = ["page-tab3.1", "page-tab3.2", "page-tab3.3"];

  pageIds.forEach((pageId, index) => {
    const page = document.getElementById(pageId);
    if (!page) {
      return;
    }

    const conversation = conversations[index] || null;

    if (!conversation) {
      page.innerHTML = `
        <div class="content-area">
          <div class="fonttitle">No conversation saved</div>
          <div class="fontbody">Your recent chat summaries will appear here.</div>
        </div>
      `;
      return;
    }

    const groups = normalizeConversationNotes(conversation);
    const sections = groups.length
      ? groups.map((group, groupIndex) => `
          <div style="margin-bottom: 12px;">
            <div class="fontsection">${group.username}</div>
            <ul class="pushinmore">${(group.points || []).map((point) => `<li class="fontsmallbody">${point}</li>`).join("")}</ul>
            ${groupIndex < groups.length - 1 ? "<hr>" : ""}
          </div>
        `).join("")
      : "<div class=\"fontsmallbody\">No notes yet</div>";

    page.innerHTML = `
      <div class="content-area">
        <div class="fonttitle">${conversation.title}</div>
        <div class="fontbody">${(conversation.people || []).join(", ") || "No participants"}</div>
        <div class="fontbody">${conversation.date || "Recent"}</div>
        <div class="fontsmallbody">${conversation.platform || "Current chat"}</div>
        <div class="content-area-tabB">
          ${sections}
        </div>
      </div>
    `;
  });
}

function renderStoredData(data = null) {
  const viewData = data || { contacts: {}, conversations: [] };
  const contacts = Object.values(viewData.contacts || {});
  const contactPanel = document.querySelector("#page-tab2 .panel");
  const conversationPanel = document.querySelector("#page-tab3 .panel");

  if (contactPanel) {
    if (!contacts.length) {
      contactPanel.innerHTML = "";
    } else {
      contactPanel.innerHTML = contacts
        .map((contact) => `
          <button class="tabB listitem fontbody" data-tab="tab2.1">
            ${contact.name}
            <div class="fontsub">${(contact.platforms && contact.platforms.length ? contact.platforms.join(", ") : "Current chat")}</div>
          </button>
        `)
        .join("");
    }
  }

  if (conversationPanel) {
    const conversations = viewData.conversations || [];
    if (!conversations.length) {
      conversationPanel.innerHTML = "";
    } else {
      conversationPanel.innerHTML = conversations
        .map((conversation) => `
          <button class="tabB listitem fontbody" data-tab="tab3.1">
            ${conversation.title}
            <div class="fontsub">${conversation.date || "Recent"} - ${conversation.platform || "Current chat"}</div>
          </button>
        `)
        .join("");
    }
  }

  renderContactDetailPages(viewData);
  renderConversationDetailPages(viewData);

  document.querySelectorAll("#page-tab2 .tabB, #page-tab3 .tabB").forEach((tabB) => {
    tabB.onclick = () => {
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      const targetPage = document.getElementById(`page-${tabB.dataset.tab}`);
      if (targetPage) {
        targetPage.classList.add("active");
      }
    };
  });
}

async function updateContactAndConversationSummary(aiResponse, pageText, sourceUrl) {
  const data = await loadOutThereData();
  const participantNames = dedupeList((aiResponse?.participants || [])
    .map((person) => normalizeName(person.username))
    .filter((name) => name && !/^you$/i.test(name)));

  const primaryContactName = inferCurrentContactName(aiResponse, pageText);
  const targetNames = dedupeList([primaryContactName, ...participantNames]).filter((name) => name && !/^unknown contact$/i.test(name));

  if (!targetNames.length) {
    targetNames.push("Unknown Contact");
  }

  targetNames.forEach((personName) => {
    const contact = data.contacts[personName] || createContactRecord(personName);
    data.contacts[personName] = updateContactRecord(contact, aiResponse, personName);

    if (sourceUrl) {
      try {
        const host = new URL(sourceUrl).hostname.replace(/^www\./, "");
        data.contacts[personName].platforms = dedupeList([...(data.contacts[personName].platforms || []), host]);
      } catch {
        // Ignore invalid URLs.
      }
    }
  });

  upsertConversationRecord(data, aiResponse, primaryContactName, sourceUrl);
  await saveOutThereData(data);
  renderStoredData(data);

  return { personName: primaryContactName, contact: data.contacts[primaryContactName] || data.contacts[targetNames[0]] };
}

// ═════════════════════════════════════════════════════════════
// SECTION 3 — HELPER FUNCTIONS
// Already set up. Do not edit.
// Call these anywhere in Section 4 to perform actions.
//
//   await getPageText()            — reads the current webpage
//   await openTab("https://...")   — opens a new tab
//   await closeCurrentTab()        — closes the active tab
//   await closeTabByName("youtube")— closes a tab by URL or title
//   await askAI("your prompt")     — sends a prompt, returns JSON
// ═════════════════════════════════════════════════════════════

// Reads all the visible text on the current webpage
async function getSelectedText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || tab.url.startsWith("chrome://")) {
    throw new Error("Please navigate to a real webpage first.");
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" });
    return (response?.text || "").trim();
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" });
    return (response?.text || "").trim();
  }
}

async function getPageText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || tab.url.startsWith("chrome://")) {
    throw new Error("Please navigate to a real webpage first.");
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageText" });
    return response?.text || response?.html || "";
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageText" });
    return response?.text || response?.html || "";
  }
}

async function getPageMessageData() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || tab.url.startsWith("chrome://")) {
    throw new Error("Please navigate to a real webpage first.");
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageText" });
    return {
      text: response?.text || "",
      html: response?.html || "",
      messageBlocks: response?.messageBlocks || []
    };
  } catch {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageText" });
    return {
      text: response?.text || "",
      html: response?.html || "",
      messageBlocks: response?.messageBlocks || []
    };
  }
}

function getDemoChatText() {
  return DEMO_CHAT_TRANSCRIPT;
}

async function getConversationInputText() {
  return getDemoChatText();
}

function setPopupOutput(message) {
  const outputEl = document.getElementById("myOutput");
  if (outputEl) {
    outputEl.textContent = message;
  }
  console.log("[Out There] Popup output:", message);
}


// Sends a prompt to Groq AI and returns a parsed JSON response.
//
// IMPORTANT: Your prompt MUST tell the AI to return ONLY a JSON object
// with an "action" field. The action field tells your code what to do.
//
// Example prompt:
//   "The user said: open YouTube.
//    Reply ONLY with a JSON object like:
//    { action: 'open_tab', url: 'https://...' }
//    Possible actions: open_tab, close_tab, close_tab_by_name, summarize"
//
// The AI will return something like:
//   { action: "open_tab", url: "https://www.youtube.com" }
//   { action: "summarize", summary: "This page is about..." }

function repairJsonCandidate(candidate) {
  const text = candidate.trim();
  if (!text.startsWith("{")) {
    return null;
  }

  const stack = [];
  const closers = { "{": "}", "[": "]" };

  for (const ch of text) {
    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      const expected = closers[stack[stack.length - 1]];
      if (expected === ch) {
        stack.pop();
      }
    }
  }

  let repaired = text;
  while (stack.length) {
    const opener = stack.pop();
    repaired += closers[opener];
  }

  return repaired;
}

function normalizeMessageEntries(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const text = String(entry.text ?? entry.message ?? entry.content ?? "").trim();
      const sender = String(entry.sender ?? entry.author ?? entry.name ?? "").trim();
      const timestamp = entry.timestamp ?? entry.time ?? entry.sentAt ?? null;

      if (!text) {
        return null;
      }

      return {
        sender: sender || "Unknown",
        timestamp: timestamp ? String(timestamp) : null,
        text
      };
    })
    .filter(Boolean)
    .filter((entry) => entry.text.length > 0 && entry.text !== "null");
}

function parseHighlightedTranscript(rawText) {
  if (!rawText || !String(rawText).trim()) {
    return [];
  }

  let cleaned = String(rawText)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\u202F/g, " ")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = cleaned.split(/\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = [];
  const seen = new Set();
  let currentSender = null;
  let currentTimestamp = null;
  let currentText = [];

  const flushCurrent = () => {
    if (!currentSender || !currentText.length) return;

    const text = currentText
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
      .trim();

    if (!text || text === "," || text === "null") return;
    if (/^(call missed|message viewed by|press tab to navigate|read receipts list|\s*)$/i.test(text)) return;

    const key = `${currentSender}|${currentTimestamp}|${text}`;
    if (seen.has(key)) return;

    seen.add(key);
    parsed.push({ sender: currentSender, timestamp: currentTimestamp, text });
  };

  const headerPattern = /^(.+?),\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s*\d{1,2}:\d{2}\s?[AP]M\s*$/i;
  const headerPatternCompact = /^(.+?),\s*(\d{1,2}:\d{2}\s?[AP]M)\s*$/i;

  for (const line of lines) {
    if (line === ",") {
      continue;
    }

    const headerMatch = line.match(headerPattern) || line.match(headerPatternCompact);

    if (headerMatch) {
      flushCurrent();
      currentSender = headerMatch[1].trim();
      currentTimestamp = headerMatch[0].trim();
      currentText = [];
      continue;
    }

    if (!currentSender) {
      continue;
    }

    if (/^(call missed|message viewed by|press tab to navigate|read receipts list)$/i.test(line)) {
      continue;
    }

    currentText.push(line);
  }

  flushCurrent();
  return parsed;
}

function extractJsonObject(rawText) {
  if (rawText === null || rawText === undefined) {
    return null;
  }

  const cleanText = String(rawText)
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const candidates = [];

  const fencedMatches = cleanText.match(/\{[\s\S]*\}/g) || [];
  fencedMatches.forEach((match) => candidates.push(match));

  const firstBrace = cleanText.indexOf("{");
  if (firstBrace !== -1) {
    let depth = 0;
    let lastBrace = -1;

    for (let i = firstBrace; i < cleanText.length; i++) {
      if (cleanText[i] === "{") {
        depth += 1;
      } else if (cleanText[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          lastBrace = i;
          break;
        }
      }
    }

    if (lastBrace !== -1) {
      candidates.push(cleanText.slice(firstBrace, lastBrace + 1));
    }
  }

  for (const candidate of [...new Set(candidates)]) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      try {
        const repaired = repairJsonCandidate(candidate);
        if (!repaired) {
          continue;
        }
        const parsed = JSON.parse(repaired);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      } catch {
        // Fall through to the next candidate.
      }
    }
  }

  return null;
}

async function askForPageMessages(pageData) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("No API key found. Please add one in the API Key tab.");
  }

  const pageInfo = typeof pageData === "string"
    ? { text: pageData, html: "", messageBlocks: [] }
    : (pageData || { text: "", html: "", messageBlocks: [] });

  const pageText = String(pageInfo.text || "").slice(0, 12000);
  const pageHtml = String(pageInfo.html || "").slice(0, 18000);
  const messageBlocks = Array.isArray(pageInfo.messageBlocks) ? pageInfo.messageBlocks.slice(0, 20) : [];

  const systemPrompt = `You are reading the HTML of a webpage that may contain a chat UI. Extract only actual messages from the page. Ignore navigation, buttons, forms, labels, ads, banners, sidebars, and all page chrome.

Use the page HTML and text to identify message rows, conversation items, sender names, timestamps, and message contents.
Return ONLY valid JSON parseable by JSON.parse().

Expected format:
{
  "messages": [
    { "sender": "string", "timestamp": "string|null", "text": "string" }
  ]
}

Rules:
- Only include real chat messages.
- The text field is required and MUST contain the actual message content.
- Never omit text. If you cannot infer the sender or timestamp, set sender to "Unknown" and timestamp to null, but text must still be the literal message.
- Do not include explanations, markdown fences, or other text outside the JSON object.`;

  const prompt = `Page text to analyze:\n${pageText}\n\nHTML snippets to analyze:\n${pageHtml || "(no HTML snippets available)"}\n\nMessage blocks already detected:\n${JSON.stringify(messageBlocks, null, 2).slice(0, 6000)}`;

  console.log("[Out There] Page extraction prompt:", prompt);

  let lastError = null;

  for (const modelName of GROQ_MODEL_LIST) {
    try {
      GROQ_MODEL = modelName;

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 800,
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        lastError = data.error.message;
        continue;
      }

      const rawText = data.choices?.[0]?.message?.content || "";
      console.log("[Out There] Raw Groq response for page messages:", rawText);

      const transcriptFallback = parseHighlightedTranscript(pageText);
      if (transcriptFallback.length) {
        return { messages: transcriptFallback };
      }

      const parsed = extractJsonObject(rawText);
      const normalizedMessages = parsed && parsed.messages ? normalizeMessageEntries(parsed.messages) : [];

      if (normalizedMessages.length) {
        return { messages: normalizedMessages };
      }

      if (pageText && pageText.trim()) {
        return { messages: [{ sender: "Unknown", timestamp: null, text: pageText.trim().slice(0, 2000) }] };
      }

      lastError = `AI response was not in the required message format: ${rawText}`;
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(lastError || "AI did not return the expected message list.");
}

async function askAI(prompt) {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("No API key found. Please add one in the API Key tab.");
  }

  let lastModelError = null;

  for (const modelName of GROQ_MODEL_LIST) {
    try {
      const test_r = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }]
        })
      });
      const test_d = await test_r.json();

      if (test_d.error) {
        lastModelError = test_d.error.message;
        continue;
      }

      GROQ_MODEL = modelName;
      break;
    } catch (err) {
      lastModelError = err.message;
    }
  }

  if (!GROQ_MODEL) {
    throw new Error(lastModelError || "No Groq model was available from the configured model list.");
  }

  let lastResponseError = null;

  for (const modelName of GROQ_MODEL_LIST) {
    try {
      GROQ_MODEL = modelName;

      const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 800,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: prompt_request
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        lastResponseError = data.error.message;
        continue;
      }

      const message = data.choices?.[0]?.message;
      const rawText = typeof message?.content === "string"
        ? message.content
        : Array.isArray(message?.content)
          ? message.content.map((part) => typeof part === "string" ? part : (part?.text || "")).join("")
          : "";

      console.log("[Out There] Raw Groq response:", rawText);
      console.log("[Out There] Prompt sent to Groq:", prompt);

      const isReasoningOnlyResponse =
        (!rawText || rawText.trim() === "") &&
        (message?.reasoning || data.choices?.[0]?.finish_reason === "length");

      if (isReasoningOnlyResponse) {
        lastResponseError = `Model ${modelName} returned empty content and reasoning instead of final JSON.`;
        continue;
      }

      const parsed = extractJsonObject(rawText);

      if (!parsed) {
        lastResponseError = `AI did not return valid JSON: ${modelName}\n${rawText}`;
        continue;
      }

      return parsed;
    } catch (err) {
      lastResponseError = err.message;
    }
  }

  throw new Error(lastResponseError || `AI did not return valid JSON using the available Groq models.`);
}

// ═════════════════════════════════════════════════════════════
// SECTION 4 — YOUR CODE GOES HERE
//
// This is where you build your extension's features.
//
// HOW IT WORKS:
//   1. Get the user's input (from a button click, text field, etc.)
//   2. Call askAI() with a prompt describing what the user wants
//   3. Check aiResponse.action to decide what to do
//   4. Call the matching helper function
//
// EXAMPLE — wire up a button with id="myButton":
//
  document.getElementById("myButton").addEventListener("click", async () => {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const conversationText = getDemoChatText();
      const resolvedAiResponse = buildDemoConversationSummary();
      const contactSummary = await updateContactAndConversationSummary(resolvedAiResponse, conversationText, activeTab?.url || null);

      const points = resolvedAiResponse?.participants?.flatMap((person) => person.points || []) || [];
      const summaryText = points.length
        ? points.join("\n")
        : JSON.stringify(resolvedAiResponse, null, 2);

      setPopupOutput(`Updated ${contactSummary.personName}\n${summaryText}\n\nModel: demo summary`);

    } catch (err) {
      console.error(err);
      setPopupOutput("Error: " + err.message);
    }
  });

  document.getElementById("testPageAIButton").addEventListener("click", async () => {
    try {
      const selectedText = await getSelectedText();

      if (!selectedText) {
        setPopupOutput("Highlight some text on the page first, then click this button.");
        return;
      }

      const manualParse = parseHighlightedTranscript(selectedText);
      const result = manualParse.length
        ? { messages: manualParse }
        : await askForPageMessages({
            text: selectedText,
            html: "",
            messageBlocks: [{ text: selectedText, sender: "Unknown", timestamp: null }]
          });

      setPopupOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error(err);
      setPopupOutput("Error: " + err.message);
    }
  });

  document.getElementById("demoChatButton").addEventListener("click", () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("demo-chat.html")
    });
  });

  document.getElementById("googleChatHistoryButton").addEventListener("click", async () => {
    try {
      const spaceId = window.prompt("Google Chat space ID\nExample: spaces/AAAAA...\nIf you use a room URL, paste the space ID only.", "");

      if (!spaceId) {
        setPopupOutput("No Google Chat space ID entered.");
        return;
      }

      const savedToken = await getGoogleChatAccessToken();
      const accessToken = savedToken || window.prompt("Paste your Google Chat OAuth access token.", "");

      if (!accessToken) {
        setPopupOutput("No Google Chat access token found. Add one in the API Key tab first.");
        return;
      }

      const result = await processGoogleChatHistory(spaceId, accessToken, "https://chat.google.com/");
      setPopupOutput(JSON.stringify({
        spaceId,
        messageCount: result.messages.length,
        summary: result.summary,
        messages: result.messages.slice(0, 10)
      }, null, 2));
    } catch (err) {
      console.error(err);
      setPopupOutput("Error: " + err.message);
    }
  });
//
// ═════════════════════════════════════════════════════════════

// YOUR CODE HERE


// ═════════════════════════════════════════════════════════════
// SECTION 5 — INIT
// Runs once when the popup opens. Do not edit.
// ═════════════════════════════════════════════════════════════

initKeyStatus();
loadOutThereData().then((data) => renderStoredData(data));