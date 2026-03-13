const fetch = require("node-fetch");

async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log("TG ENV CHECK:", {
    hasToken: !!token,
    chatId,
  });

  if (!token || !chatId) {
    console.log("❌ Telegram env missing");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const body = await res.text();
  console.log("TG RESPONSE:", res.status, body);
}

module.exports = { notifyTelegram };
