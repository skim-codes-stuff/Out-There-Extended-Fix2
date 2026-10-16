const express = require("express");
const app = express();

const GOOGLE_CLIENT_ID = "399717800210-8606rceft9s22n82smvideh14e7r520e.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "http://localhost:3000/oauth/google/callback";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const hasSecret = GOOGLE_CLIENT_SECRET ? "Client secret loaded." : "Client secret not set yet.";

  res.send(`
    <h1>Google Chat OAuth demo</h1>
    <p>${hasSecret}</p>
    <form method="POST" action="/set-client-secret">
      <label for="clientSecret">Google Client Secret</label><br />
      <input id="clientSecret" name="clientSecret" type="password" size="80" placeholder="Paste your Google OAuth client secret" />
      <button type="submit">Save secret</button>
    </form>
    <p><a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/chat.messages.readonly")}&access_type=offline&prompt=consent">Sign in with Google</a></p>
  `);
});

app.post("/set-client-secret", (req, res) => {
  const clientSecret = String(req.body.clientSecret || "").trim();

  if (!clientSecret) {
    return res.status(400).send("Client secret is required.");
  }

  process.env.GOOGLE_CLIENT_SECRET = clientSecret;

  res.send(`
    <h1>Client secret saved in memory for this session.</h1>
    <p><a href="/">Back to home</a></p>
  `);
});

app.get("/oauth/google/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received from Google.");
  }

  if (!process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(400).send("No Google client secret available. Enter one on the homepage first.");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokenData);
      return res.status(400).send(`<pre>${JSON.stringify(tokenData, null, 2)}</pre>`);
    }

    console.log("Google token response:", tokenData);

    res.send(`
      <h1>Token received</h1>
      <pre>${JSON.stringify(tokenData, null, 2)}</pre>
      <p>Copy the access_token value into the extension's Google Chat token field.</p>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Token exchange failed: " + err.message);
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});