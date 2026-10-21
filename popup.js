const OUT_THERE_DATA_KEY = "outThereDemoData";
const DEMO_PLATFORM = "localhost";
const DEMO_MESSAGES = [
  { sender: "Dimitry", text: "Hey, are you free to work on the fake Apple Event video today?" },
  { sender: "You", text: "I think so. What time were you thinking?" },
  { sender: "Dimitry", text: "Whenever works for you. I can bring the products over." },
  { sender: "You", text: "I have coding class until 1:30, but after that should be okay." },
  { sender: "Dimitry", text: "Oh right, I forgot about class. No rush, we can keep it simple." },
  { sender: "You", text: "What products do you have? I was thinking we could plan a few shots." },
  { sender: "Dimitry", text: "AirPods Pro and the iPhone 16 Pro. Maybe the watch too if I can find it." },
  { sender: "You", text: "That gives us a few options. I can make a shot list before we start." },
  { sender: "Dimitry", text: "That would help. I don't really know what looks good on camera." },
  { sender: "You", text: "No problem. We can test a couple of angles and choose together." },
  { sender: "Dimitry", text: "Cool. I can bring my small tripod and the lights." },
  { sender: "You", text: "Could you bring a different shirt too? We might want the shots to look like separate scenes." },
  { sender: "Dimitry", text: "Sure, I have a few. Do you want me to dress formal or casual?" },
  { sender: "You", text: "Casual is probably easiest. A plain shirt would keep attention on the products." },
  { sender: "Dimitry", text: "Got it. I was worried you meant we needed actual costumes or something." },
  { sender: "You", text: "No, nothing complicated. Just a change of shirt between setups if we have time." },
  { sender: "Dimitry", text: "Okay, that sounds manageable." },
  { sender: "You", text: "Where should we meet? The clubhouse has good light in the afternoon." },
  { sender: "Dimitry", text: "Northpark clubhouse works. Should I ask anyone else to come?" },
  { sender: "You", text: "Maybe just us for the first pass. We can invite someone later if we need another person on camera." },
  { sender: "Dimitry", text: "Sure. I wasn't sure if you wanted me to invite people, so I'll leave it for now." },
  { sender: "You", text: "Thanks. I like having a plan before adding more people." },
  { sender: "Dimitry", text: "Do you want me to bring snacks or anything?" },
  { sender: "You", text: "That is kind of you. You don't need to, but water would be useful." },
  { sender: "Dimitry", text: "I can bring water. I might be a few minutes late if the bus is slow." },
  { sender: "You", text: "That's okay. Message me if you're running more than ten minutes behind." },
  { sender: "Dimitry", text: "Will do. So after your class, at the clubhouse, around 2?" },
  { sender: "You", text: "Yes, 2:15 gives me time to get there. Let's start with the shot list and see how much we get done." },
  { sender: "Dimitry", text: "Perfect. I'll bring the phone, AirPods, tripod, lights, and a plain shirt." },
  { sender: "You", text: "Great, I'll bring the shot list. We can decide about the watch when you find it." },
  { sender: "Dimitry", text: "Sounds good. Thanks for organizing this with me." },
  { sender: "You", text: "Of course. See you at 2:15!" }
];

const DEMO_CONTACTS = {
  Dimitry: {
    name: "Dimitry",
    description: "Sample profile based on the demo conversation.",
    platforms: [DEMO_PLATFORM],
    profile: [
      {
        heading: "Personality and interaction style",
        points: [
          "Comes across as friendly, collaborative, and willing to contribute.",
          "Offers practical help and checks expectations rather than assuming.",
          "This is an impression from one fictional conversation, not a complete personality assessment."
        ]
      },
      {
        heading: "Likes and preferences observed",
        points: [
          "Interested in making a product video together.",
          "Offers to bring filming gear and products.",
          "Seems comfortable with a casual, low-pressure plan."
        ]
      },
      {
        heading: "Dislikes and constraints observed",
        points: [
          "No clear dislikes are stated in this conversation.",
          "He expresses uncertainty about what looks good on camera; this may mean he appreciates collaborative guidance."
        ]
      },
      {
        heading: "Inside jokes and shared references",
        points: [
          "No established inside jokes appear in this conversation."
        ]
      },
      {
        heading: "What he may mean",
        points: [
          "“Whenever works for you” / “no rush” — likely offering flexibility; confirm if timing matters.",
          "“I don't really know what looks good” — may be asking for input, not signaling disinterest.",
          "Questions about clothes or inviting others — may be checking what you expect before preparing."
        ]
      }
    ]
  },
  You: {
    name: "You",
    description: "Sample profile of your preferences shown in the demo conversation.",
    platforms: [DEMO_PLATFORM],
    profile: [
      {
        heading: "Personality and interaction style",
        points: [
          "Comes across as organized, considerate, and collaborative.",
          "Offers reassurance and suggests making creative choices together.",
          "This is an impression from one fictional conversation, not a complete personality assessment."
        ]
      },
      {
        heading: "Likes and preferences observed",
        points: [
          "Prefers a shot list and a clear starting plan.",
          "Suggests simple, casual clothing so attention stays on the products.",
          "Prefers beginning with a small group and adding people only if useful."
        ]
      },
      {
        heading: "Dislikes and constraints observed",
        points: [
          "Has coding class until 1:30, so 2:15 is a better meeting time.",
          "No strong dislikes are stated; the conversation shows a preference for keeping the setup simple."
        ]
      },
      {
        heading: "Inside jokes and shared references",
        points: [
          "No established inside jokes appear in this conversation."
        ]
      },
      {
        heading: "What you may mean",
        points: [
          "“Let's start with the shot list” — helps establish a manageable first step, not a demand to finish everything.",
          "“Maybe just us for the first pass” — sets the initial group size while leaving room to invite someone later.",
          "“Water would be useful” — a specific request while making snacks optional."
        ]
      }
    ]
  }
};

const DEMO_CONVERSATION = {
  title: "Fake Apple Event video",
  date: "Demo conversation",
  platform: DEMO_PLATFORM,
  context: "Planning a collaborative product video after class: deciding what to film, what to bring, who to invite, and when and where to meet.",
  outcome: "Meet at Northpark clubhouse at 2:15. Dimitry brings products and filming gear; You bring a shot list. Start with the two of you and keep the plan flexible.",
  people: ["Dimitry", "You"],
  notes: [
    {
      username: "Dimitry — in this moment",
      points: [
        "Intent — He wants to make the video and volunteers to bring several items.",
        "Tone — Friendly, flexible, and appreciative.",
        "Context — He checks whether you want formal or casual clothes and whether to invite others, suggesting he wants to match your expectations.",
        "Possible subtext — “I don't really know what looks good” may be a request to plan together; you respond by offering to test angles.",
        "Coordination — He agrees to the clubhouse, offers water, and says he will message if delayed."
      ]
    },
    {
      username: "You — in this moment",
      points: [
        "Intent — You agree to make the video and propose preparing a shot list.",
        "Tone — Reassuring and practical; you explain your timing and give clear next steps.",
        "Context — You prefer a simple setup and to start with just the two of you.",
        "Possible subtext — You make the plan predictable while still leaving choices open to decide together.",
        "Coordination — You set 2:15, name the clubhouse, and clarify what each person will bring."
      ]
    }
  ],
  messages: DEMO_MESSAGES
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function getSavedData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(OUT_THERE_DATA_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const saved = result[OUT_THERE_DATA_KEY] || {};
      const data = {
        contacts: saved.contacts || {},
        conversations: Array.isArray(saved.conversations) ? saved.conversations : []
      };
      let migrated = false;

      for (const name of ["Dimitry", "You"]) {
        if (data.contacts[name] && !Array.isArray(data.contacts[name].profile)) {
          data.contacts[name] = DEMO_CONTACTS[name];
          migrated = true;
        }
      }

      const demoConversationIndex = data.conversations.findIndex(
        (conversation) => conversation.title === DEMO_CONVERSATION.title
      );
      if (demoConversationIndex !== -1 && !data.conversations[demoConversationIndex].context) {
        data.conversations[demoConversationIndex] = DEMO_CONVERSATION;
        migrated = true;
      }

      if (migrated) {
        chrome.storage.local.set({ [OUT_THERE_DATA_KEY]: data }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(data);
        });
        return;
      }

      resolve(data);
    });
  });
}

function saveData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [OUT_THERE_DATA_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function setActivePage(pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  const tabId = pageId.startsWith("page-tab2") ? "tab2"
    : pageId.startsWith("page-tab3") ? "tab3"
      : "tab1";
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
}

function renderKeyPoints(container, points) {
  const list = createElement("ul", "pushinmore");
  (points || []).forEach((point) => {
    list.appendChild(createElement("li", "fontsmallbody", point));
  });
  container.appendChild(list);
}

function renderContactDetail(contact) {
  const page = document.getElementById("page-tab2.1");
  page.replaceChildren();

  const card = createElement("div", "content-area");
  card.appendChild(createElement("div", "fonttitle", contact.name));
  card.appendChild(createElement("div", "fontsmallbody", contact.description || "Demo contact"));
  const notes = createElement("div", "content-area-tabB");
  notes.appendChild(createElement("p", "fontsub", "Profile clues are based on the demo conversation; possible meanings are not certain. Patterns should be checked across conversations."));
  (contact.profile || []).forEach((section) => {
    notes.appendChild(createElement("div", "fontsection", section.heading));
    renderKeyPoints(notes, section.points);
  });
  card.appendChild(notes);
  page.appendChild(card);
  setActivePage("page-tab2.1");
}

function renderConversationDetail(conversation) {
  const page = document.getElementById("page-tab3.1");
  page.replaceChildren();

  const card = createElement("div", "content-area");
  card.appendChild(createElement("div", "fonttitle", conversation.title));
  card.appendChild(createElement("div", "fontbody", (conversation.people || []).join(", ")));
  card.appendChild(createElement("div", "fontsmallbody", `${conversation.date || "Demo"} · ${conversation.platform || DEMO_PLATFORM}`));
  const notes = createElement("div", "content-area-tabB");
  notes.appendChild(createElement("p", "fontsub", "Tone and subtext are possible interpretations, not certainty."));
  if (conversation.context) {
    notes.appendChild(createElement("div", "fontsection", "MOMENT AND CONTEXT"));
    notes.appendChild(createElement("p", "fontsmallbody", conversation.context));
  }
  if (conversation.outcome) {
    notes.appendChild(createElement("div", "fontsection", "AGREED PLAN"));
    notes.appendChild(createElement("p", "fontsmallbody", conversation.outcome));
  }

  (conversation.notes || []).forEach((group, index) => {
    notes.appendChild(document.createElement("hr"));
    notes.appendChild(createElement("div", "fontsection", group.username));
    renderKeyPoints(notes, group.points);
  });

  notes.appendChild(document.createElement("hr"));
  notes.appendChild(createElement("div", "fontsection", "DEMO CHAT TRANSCRIPT"));
  (conversation.messages || []).forEach((message) => {
    const line = createElement("p", "fontsmallbody");
    line.style.marginTop = "8px";
    line.textContent = `${message.sender}: ${message.text}`;
    notes.appendChild(line);
  });
  card.appendChild(notes);
  page.appendChild(card);
  setActivePage("page-tab3.1");
}

function renderStoredData(data) {
  const contacts = Object.values(data.contacts);
  const contactPanel = document.querySelector("#page-tab2 .panel");
  contactPanel.replaceChildren();
  contacts.forEach((contact) => {
    const button = createElement("button", "tabB listitem fontbody");
    button.appendChild(document.createTextNode(contact.name));
    button.appendChild(createElement("div", "fontsub", (contact.platforms || [DEMO_PLATFORM]).join(", ")));
    button.addEventListener("click", () => renderContactDetail(contact));
    contactPanel.appendChild(button);
  });

  const conversations = data.conversations;
  const conversationPanel = document.querySelector("#page-tab3 .panel");
  conversationPanel.replaceChildren();
  conversations.forEach((conversation) => {
    const button = createElement("button", "tabB listitem fontbody");
    button.appendChild(document.createTextNode(conversation.title));
    button.appendChild(createElement("div", "fontsub", `${conversation.date || "Demo"} - ${conversation.platform || DEMO_PLATFORM}`));
    button.addEventListener("click", () => renderConversationDetail(conversation));
    conversationPanel.appendChild(button);
  });

  if (!contacts.length) {
    document.getElementById("page-tab2.1").replaceChildren(
      createElement("div", "content-area fontsmallbody", "Click Summarize Demo Conversation to add Dimitry and You.")
    );
  }
  if (!conversations.length) {
    document.getElementById("page-tab3.1").replaceChildren(
      createElement("div", "content-area fontsmallbody", "The demo conversation will appear here after you summarize it.")
    );
  }
}

async function summarizeDemoConversation() {
  const button = document.getElementById("myButton");
  const status = document.getElementById("summaryStatus");
  button.disabled = true;
  status.textContent = "Adding the demo contacts and conversation...";

  try {
    const data = await getSavedData();
    const contacts = {
      Dimitry: DEMO_CONTACTS.Dimitry,
      You: DEMO_CONTACTS.You,
      ...Object.fromEntries(
        Object.entries(data.contacts).filter(([name]) => name !== "Dimitry" && name !== "You")
      )
    };

    const conversations = [
      DEMO_CONVERSATION,
      ...data.conversations.filter((item) => item.title !== DEMO_CONVERSATION.title)
    ];
    const mergedData = { contacts, conversations };
    await saveData(mergedData);
    renderStoredData(mergedData);
    status.textContent = "Demo conversation added. Open Contacts or Conversations to explore the keypoints.";
  } catch (error) {
    console.error(error);
    status.textContent = `Could not save the demo: ${error.message}`;
  } finally {
    button.disabled = false;
  }
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setActivePage(`page-${tab.dataset.tab}`));
});

document.getElementById("myButton").addEventListener("click", summarizeDemoConversation);
document.getElementById("demoChatButton").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/" });
});

document.getElementById("clearStorageButton").addEventListener("click", async () => {
  try {
    await new Promise((resolve, reject) => {
      chrome.storage.local.remove(OUT_THERE_DATA_KEY, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
    renderStoredData({ contacts: {}, conversations: [] });
    document.getElementById("summaryStatus").textContent = "Saved demo contacts and conversations cleared.";
  } catch (error) {
    document.getElementById("summaryStatus").textContent = `Could not clear saved data: ${error.message}`;
  }
});

getSavedData()
  .then(renderStoredData)
  .catch((error) => {
    console.error(error);
    document.getElementById("summaryStatus").textContent = `Could not load saved data: ${error.message}`;
  });
