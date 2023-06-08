import { createBot, Intents, startBot } from "./deps.ts";
import { Secret } from "./secret.ts";

const bot = createBot({
  token: Secret.DISCORD_TOKEN,
  intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent,
  events: {
    ready: (_bot, payload) => {
      console.log(`${payload.user.username} is ready!`);
    },
  },
});

bot.events.messageCreate = async (b, message) => {
  if (message.content === "!t") {
    b.helpers.sendMessage(message.channelId, {
      content: "テスト",
    });
    b.helpers.addReaction(
      message.channelId,
      message.id,
      "🙂",
    );
  }
  const messages = b.helpers.getMessages(message.channelId);
  await messages.then((res) => {
    console.log(res);
  });
  const channel = b.helpers.getChannel(message.channelId);
  await channel.then((res) => {
    console.log(res);
  });
};

await startBot(bot);
