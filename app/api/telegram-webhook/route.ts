// app/api/telegram-webhook/route.ts
import { NextRequest } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const chatId = body?.message?.chat?.id;
  const text = body?.message?.text;

  if (!chatId || !text) {
    return new Response("Missing data", { status: 400 });
  }
  

  switch (text) {
    case "/start":
      await sendMessage(
        chatId,
        `Welcome to <b>Qopchiq</b> 💰!\nOpen the app here:\nhttps://your-webapp-url`
      );
      break;

    case "/help":
      await sendMessage(
        chatId,
        `Qopchiq yordam menyusi:\n\n💰 Xarajatlarni yozing\n🥗 Ovqatlaringizni kiritish\n💧 Suv ichganingizni belgilash\n🎯 Ball to‘plang va yutuqlarni oching`
      );
      break;

    case "/language":
      await sendMessage(chatId, `Please choose a language: uz / ru / en`);
      break;

    case "/stats":
      await sendMessage(
        chatId,
        `📊 To view your stats, please open the app: https://your-webapp-url`
      );
      break;

    case "/feedback":
      await sendMessage(
        chatId,
        `📝 Please reply with your feedback. Biz har bir fikrni o‘qiymiz!`
      );
      break;

    default:
      await sendMessage(chatId, `🤖 Unknown command. Type /help for options.`);
  }

  return new Response("OK");
}
