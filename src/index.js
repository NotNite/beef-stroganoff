const Koa = require("koa");
const Router = require("@koa/router");
const Eris = require("eris");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./config.json"));

const bot = new Eris.Client("Bot " + config.token, {
  restMode: true,
  intents: Eris.Constants.Intents.allNonPrivileged
});

const app = new Koa();
const router = new Router();

bot.on("ready", () => {
  console.log(`Loading ${config.sounds.length} sounds`);
  bot.bulkEditGuildCommands(config.guild, [{
    name: "stroganoff",
    description: "she strogan me off till i beef!",
    options: [{
      name: "sound",
      description: "[EXTREMELY LOUD INCORRECT BUZZER]",
      type: 3,
      required: true,
      choices: config.sounds.map(x => {
        return {
          name: x.name,
          value: x.name
        };
      })
    }]
  }]);
});

async function playBall(soundID) {
    const sound = config.sounds.find(x => x.name === soundID);

    const conn = await bot.joinVoiceChannel(config.channel, {
        selfDeaf: true
    });

    conn.play(sound.path);

    conn.once("end", () => {
        bot.leaveVoiceChannel(config.channel);
    });
}

bot.on("interactionCreate", async (interaction) => {
  const soundID = interaction.data.options[0].value;

  await interaction.createMessage({
      content: `Playing sound in <#${config.channel}>`,
      flags: 64
  });

  await playBall(soundID);
});

router.get("/:id", async (ctx) => {
    const id = ctx.params.id;
    await playBall(id);
    ctx.status = 204;
})

app.use(router.middleware());
app.listen(config.port);
bot.connect();
