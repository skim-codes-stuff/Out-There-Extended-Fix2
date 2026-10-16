// ─────────────────────────────────────────
// Content Script
// Runs on every webpage — reads page content
// ─────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === "getSelectedText") {
    const selection = (window.getSelection && window.getSelection().toString()) || "";
    const text = (selection || "").replace(/\s+/g, " ").trim();
    sendResponse({ text });
    return;
  }

  if (request.action === "getPageText") {
    const cleanText = (value) => (value || "").replace(/\s+/g, " ").trim();
    const isGoogleChat = /chat\.google\.com|google\.com\/chat/i.test(window.location.href || "");
    const blockedSelector = [
      "header",
      "nav",
      "footer",
      "aside",
      "form",
      "button",
      "input",
      "textarea",
      "select",
      "option",
      "label",
      "svg",
      "img",
      "script",
      "style",
      "[role='button']",
      "[role='navigation']",
      "[role='banner']",
      "[role='menubar']",
      "[role='menu']",
      "[role='tablist']",
      "[aria-label*='menu']",
      "[aria-label*='button']",
      "[type='submit']",
      "[type='button']"
    ].join(", ");

    const isLikelyMessageNode = (node) => {
      if (!node || typeof node.textContent !== "string") return false;
      if (node.closest(blockedSelector)) return false;

      const text = cleanText(node.textContent);
      if (!text || text.length < 3 || text.length > 2000) return false;

      const lower = text.toLowerCase();
      const hasChatPattern = /(?:^|\s)(?:[a-z][a-z0-9_.-]*\s*[:\-]|[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s*[:\-]|\d{1,2}:\d{2})/.test(text);
      const isTimePattern = /\b(?:\d{1,2}:\d{2}(?:\s?[ap]m)?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)\b/i.test(text);
      const hasMessageWords = /\b(?:hello|hi|hey|thanks|thanks!|good|great|can|will|let|meet|reply|send|today|tomorrow|we|i|you|they|he|she|need|want|talk|call)\b/i.test(lower);

      return hasChatPattern || isTimePattern || hasMessageWords;
    };

    const googleChatSelectors = [
      "[role='listitem']",
      "div[role='listitem']",
      "[data-sender-name]",
      "[data-sender]",
      "[data-message-text]",
      "[data-timestamp]",
      "time",
      "article",
      "li"
    ];

    const googleChatMessageBlocks = [];
    const seenGoogle = new Set();

    if (isGoogleChat) {
      for (const selector of googleChatSelectors) {
        const nodes = document.querySelectorAll(selector);
        if (!nodes.length) continue;

        for (const node of nodes) {
          const text = cleanText(node.textContent || "");
          if (!text || text.length < 2 || text.length > 2000) continue;

          const senderNode = node.querySelector("[data-sender-name], [data-sender], [aria-label*='message by'], .sender, .author, .username, .user-name") || node;
          const senderText = cleanText(senderNode.textContent || "");
          const messageText = text.replace(new RegExp(`^${senderText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'), '').trim();

          const timestampMatch = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s*\d{1,2}:\d{2}\s?[AP]M|\d{1,2}:\d{2}\s?[AP]M/i);
          const timestampText = timestampMatch ? timestampMatch[0] : "";

          if (!messageText || messageText.length < 2) continue;
          if (/^(call missed|press tab to navigate to the read receipts list|message viewed by|read receipts)$/i.test(messageText)) continue;

          const html = (node.outerHTML || "").slice(0, 2500);
          if (seenGoogle.has(html)) continue;

          seenGoogle.add(html);
          googleChatMessageBlocks.push({
            text: messageText,
            html,
            sender: senderText && senderText !== messageText ? senderText : "Unknown",
            timestamp: timestampText || null
          });
        }

        if (googleChatMessageBlocks.length >= 30) break;
      }
    }

    const messageSelectors = [
      "[role='listitem']",
      "[role='article']",
      "[data-message-text]",
      "[data-sender-name]",
      "[data-sender]",
      ".msg",
      ".message",
      ".chat-message",
      ".conversation-message",
      ".message-row",
      ".thread-message",
      ".direct-message",
      ".text-message",
      ".chat-item",
      ".message-content",
      ".chat-bubble",
      "li",
      "article"
    ];

    const messageBlocks = isGoogleChat ? googleChatMessageBlocks : [];
    const seen = new Set();

    if (!messageBlocks.length) {
      for (const selector of messageSelectors) {
        const nodes = document.querySelectorAll(selector);
        if (!nodes.length) continue;

        for (const node of nodes) {
          if (!isLikelyMessageNode(node)) continue;

          const text = cleanText(node.textContent || "");
          const html = (node.outerHTML || "").slice(0, 2500);
          if (!text || seen.has(html)) continue;

          const senderText = cleanText(
            node.querySelector("[data-sender-name], [data-sender], .sender, .author, .username, .name, .user-name")?.textContent || ""
          );

          const timestampText = cleanText(
            node.querySelector("time, [data-timestamp], .timestamp, .time, .sent-at, .date")?.textContent || ""
          );

          messageBlocks.push({
            text,
            html,
            sender: senderText && senderText !== text ? senderText : "",
            timestamp: timestampText && timestampText !== text ? timestampText : ""
          });

          seen.add(html);
        }

        if (messageBlocks.length >= 20) break;
      }
    }

    if (!messageBlocks.length) {
      const allNodes = Array.from(document.querySelectorAll("div, li, p, article, span"));
      for (const node of allNodes) {
        if (!isLikelyMessageNode(node)) continue;

        const text = cleanText(node.textContent || "");
        const html = (node.outerHTML || "").slice(0, 2500);
        if (!text || seen.has(html)) continue;

        messageBlocks.push({ text, html, sender: "", timestamp: "" });
        seen.add(html);

        if (messageBlocks.length >= 20) break;
      }
    }

    let text = "";
    let html = "";

    if (messageBlocks.length) {
      text = messageBlocks
        .map((block) => {
          const sender = block.sender ? `${block.sender}: ` : "";
          const ts = block.timestamp ? ` [${block.timestamp}]` : "";
          return `${sender}${block.text}${ts}`;
        })
        .join("\n");

      html = messageBlocks.map((block) => block.html).join("\n\n");
    } else {
      const clone = document.body.cloneNode(true);

      clone.querySelectorAll(blockedSelector).forEach((node) => node.remove());
      text = cleanText(clone.innerText || "");
      html = (clone.innerHTML || "").slice(0, 25000);
    }

    sendResponse({ text, html, messageBlocks });
  }

});