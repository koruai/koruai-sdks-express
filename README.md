# KoruAI Express

Welcome to **KoruAI Express**! 🚦

This package helps you add AI-powered security monitoring to your Express.js apps. It quietly watches your API traffic and lets you know if something looks fishy—so you can focus on building, not worrying about threats.

## What does it do?

- Monitors incoming requests and outgoing responses
- Sends request data to KoruAI servers for analysis
- Can block suspicious requests in real-time (if you want)
- Super easy to plug into any Express app

## Installation

```bash
npm install koruai
```

## Quick Start

Here's how you can add KoruAI to your Express app:

```js
import express from "express";
import KoruAI from "koruai";

const app = express();

app.use(
  KoruAI({
    apiKey: "YOUR_API_KEY",
    appId: "YOUR_APP_ID",
    blockRealtime: true, // Optional: block requests if anomaly detected
  })
);

// Your routes here
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Config Options

- `apiKey` (**required**): Your KoruAI API key
- `appId` (**required**): Your app's ID
- `blockRealtime` (optional): If `true`, blocks requests that look like anomalies

## Why use this?

- Peace of mind: Let AI watch for weird stuff
- Easy setup: Just a few lines of code
- Works with any Express app

---

Made with ❤️ by aboveStars
