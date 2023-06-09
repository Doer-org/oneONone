import { MESSAGE_TEXT } from "./constants.ts";
import { createBot, Cron, Intents, startBot } from "./deps.ts";
import { Secret } from "./secret.ts";
import {
  createResultMessage,
  createStartMessage,
  getReactedMessage,
  getReactingUserIds,
  getReactionEmojis,
} from "./utils.ts";

const bot = createBot({
  token: Secret.DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready: (_bot, payload) => {
      console.log(`${payload.user.username} is ready!`);
    },
  },
});

bot.events.messageCreate = (bot, message) => {
  if (message.content === "!health") {
    bot.helpers.sendMessage(message.channelId, { content: "good!" });
  }
};

const day = 60 * 60 * 24;

// 指定時刻に1on1への参加を可否を聞くCron
// 月曜日の21時に流す
new Cron("0 0 21 * * MON", { interval: day * 7, timezone: "Asia/Tokyo" }, () => {
  bot.helpers.sendMessage(Secret.MY_CHANNEL_ID, { content: MESSAGE_TEXT });
});

// 開始時刻前になったらマッチ結果をお知らせしてくれるCron
// 木曜日の21時に流す
new Cron("0 0 21 * * THU", { interval: day * 7, timezone: "Asia/Tokyo" }, async () => {
  const messages = await bot.helpers.getMessages(Secret.MY_CHANNEL_ID);
  const reactedMessage = getReactedMessage({ messages });
  const reactedEmojis = getReactionEmojis(reactedMessage);
  const reactingUserIds = await getReactingUserIds({ bot, messageId: reactedMessage?.id, emojis: reactedEmojis });
  const resultMessage = createResultMessage(reactingUserIds);
  bot.helpers.sendMessage(Secret.MY_CHANNEL_ID, { content: resultMessage });
});

// 開催時刻に流れる
// 木曜日の21時30分に流す
new Cron("0 30 21 * * THU", { interval: day * 7, timezone: "Asia/Tokyo" }, async () => {
  const messages = await bot.helpers.getMessages(Secret.MY_CHANNEL_ID);
  const reactedMessage = getReactedMessage({ messages });
  const reactedEmojis = getReactionEmojis(reactedMessage);
  const reactingUserIds = await getReactingUserIds({ bot, messageId: reactedMessage?.id, emojis: reactedEmojis });
  if (reactingUserIds.length === 0 || reactingUserIds.length === 1) return;
  const startMessage = createStartMessage(reactingUserIds);
  bot.helpers.sendMessage(Secret.MY_CHANNEL_ID, { content: startMessage });
});

await startBot(bot);
