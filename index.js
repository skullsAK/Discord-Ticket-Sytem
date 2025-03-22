const {
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  GatewayIntentBits,
  Partials,
  ChannelType,
} = require("discord.js");
const fs = require("fs");
const config = require("./config.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});
const logsChannelID = "1352954296190111826";

async function sendLog(embed) {
  const logChannel = await client.channels.cache.get(logsChannelID);
  if (logChannel) logChannel.send({ embeds: [embed] });
}
client.on("guildMemberAdd", async (member) => {
  const embed = new EmbedBuilder()
    .setTitle("Nyt medlem joinede")
    .setDescription(`Bruger: <@${member.id}>`)
    .setColor("Green")
    .setTimestamp();
  sendLog(embed);
});

client.on("guildMemberRemove", async (member) => {
  const embed = new EmbedBuilder()
    .setTitle("Medlem forlod")
    .setDescription(`Bruger: ${member.user.tag}`)
    .setColor("Red")
    .setTimestamp();
  sendLog(embed);
});

client.on("guildBanAdd", async (ban) => {
  const embed = new EmbedBuilder()
    .setTitle("Bruger bannet")
    .setDescription(`Bruger: ${ban.user.tag}`)
    .setColor("DarkRed")
    .setTimestamp();
  sendLog(embed);
});

client.on("guildBanRemove", async (ban) => {
  const embed = new EmbedBuilder()
    .setTitle("Bruger unbannet")
    .setDescription(`Bruger: ${ban.user.tag}`)
    .setColor("Green")
    .setTimestamp();
  sendLog(embed);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const embed = new EmbedBuilder()
    .setTitle("Ny besked")
    .addFields(
      { name: "Bruger", value: `<@${message.author.id}>`, inline: true },
      { name: "Kanal", value: `<#${message.channel.id}>`, inline: true },
      { name: "Indhold", value: `${message.content || "Ingen tekst"}` },
    )
    .setColor("Blue")
    .setTimestamp();
  sendLog(embed);
});

client.on("messageDelete", async (message) => {
  if (message.author?.bot) return;
  const embed = new EmbedBuilder()
    .setTitle("Besked slettet")
    .addFields(
      { name: "Bruger", value: `<@${message.author.id}>`, inline: true },
      { name: "Kanal", value: `<#${message.channel.id}>`, inline: true },
      { name: "Indhold", value: `${message.content || "Ingen tekst"}` },
    )
    .setColor("Red")
    .setTimestamp();
  sendLog(embed);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return;
  const embed = new EmbedBuilder()
    .setTitle("Besked redigeret")
    .addFields(
      { name: "Bruger", value: `<@${oldMessage.author.id}>`, inline: true },
      { name: "Kanal", value: `<#${oldMessage.channel.id}>`, inline: true },
      { name: "Før", value: `${oldMessage.content || "Ingen tekst"}` },
      { name: "Efter", value: `${newMessage.content || "Ingen tekst"}` },
    )
    .setColor("Yellow")
    .setTimestamp();
  sendLog(embed);
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const addedRoles = newMember.roles.cache.filter(
    (role) => !oldMember.roles.cache.has(role.id),
  );
  const removedRoles = oldMember.roles.cache.filter(
    (role) => !newMember.roles.cache.has(role.id),
  );

  addedRoles.forEach((role) => {
    const embed = new EmbedBuilder()
      .setTitle("+ Rolle tildelt")
      .setDescription(`Bruger: <@${newMember.id}>\nRolle: <@&${role.id}>`)
      .setColor("Green")
      .setTimestamp();
    sendLog(embed);
  });

  removedRoles.forEach((role) => {
    const embed = new EmbedBuilder()
      .setTitle("- Rolle fjernet")
      .setDescription(`Bruger: <@${newMember.id}>\nRolle: <@&${role.id}>`)
      .setColor("Red")
      .setTimestamp();
    sendLog(embed);
  });
});

client.on("channelCreate", async (channel) => {
  const embed = new EmbedBuilder()
    .setTitle("Kanal oprettet")
    .setDescription(`Kanal: ${channel.name}`)
    .setColor("Green")
    .setTimestamp();
  sendLog(embed);
});

client.on("channelDelete", async (channel) => {
  const embed = new EmbedBuilder()
    .setTitle("Kanal slettet")
    .setDescription(`Kanal: ${channel.name}`)
    .setColor("Red")
    .setTimestamp();
  sendLog(embed);
});

client.on("channelUpdate", async (oldChannel, newChannel) => {
  const embed = new EmbedBuilder()
    .setTitle("Kanal ændret")
    .setDescription(`Fra: ${oldChannel.name}\nTil: ${newChannel.name}`)
    .setColor("Yellow")
    .setTimestamp();
  sendLog(embed);
});


client.on("voiceStateUpdate", (oldState, newState) => {
  if (!oldState.channelId && newState.channelId) {
    const embed = new EmbedBuilder()
      .setTitle("Bruger joinede voice")
      .setDescription(
        `<@${newState.member.id}> joinede ${newState.channel.name}`,
      )
      .setColor("Blue")
      .setTimestamp();
    sendLog(embed);
  } else if (oldState.channelId && !newState.channelId) {
    const embed = new EmbedBuilder()
      .setTitle("Bruger forlod voice")
      .setDescription(
        `<@${oldState.member.id}> forlod ${oldState.channel.name}`,
      )
      .setColor("Red")
      .setTimestamp();
    sendLog(embed);
  }
});

client.on("emojiCreate", (emoji) => {
  const embed = new EmbedBuilder()
    .setTitle("Emoji tilføjet")
    .setDescription(`Emoji: ${emoji.name}`)
    .setColor("Green")
    .setTimestamp();
  sendLog(embed);
});

client.on("emojiDelete", (emoji) => {
  const embed = new EmbedBuilder()
    .setTitle("Emoji slettet")
    .setDescription(`Emoji: ${emoji.name}`)
    .setColor("Red")
    .setTimestamp();
  sendLog(embed);
});

client.on("inviteCreate", (invite) => {
  const embed = new EmbedBuilder()
    .setTitle("Invite oprettet")
    .setDescription(`Invite link: ${invite.url}`)
    .setColor("Blue")
    .setTimestamp();
  sendLog(embed);
});

client.on("inviteDelete", (invite) => {
  const embed = new EmbedBuilder()
    .setTitle("Invite slettet")
    .setDescription(`Invite kode: ${invite.code}`)
    .setColor("Red")
    .setTimestamp();
  sendLog(embed);
});

require("http")
  .createServer((req, res) => res.end("Bot kører"))
  .listen(3030);

const blacklistedWords = [
  "lort",
  "fuck",
  "bitch",
  "idiot",
  "spasser",
  "retard",
  "kælling",
  "skiderik",
  "pik",
  "fisse",
  "nigger",
  "neger",
  "mongo",
  "homo",
  "bøsse",
  "klamme svin",
  "so",
  "sug min pik",
  "skod",
  "hund",
  "abekat",
  "luder",
  "knep dig selv",
  "røvhul",
  "sut min pik",
  "fuck dine forældre",
  "fuck din mor",
  "fuck din far",
  "dumme luder",
  "din mor er grim",
  "du er grim",
];

const spamCooldowns = new Map();
const spamLimit = 5;

const joinTimes = new Map();
const raidThreshold = 5;

client.on("guildMemberAdd", async (member) => {
  const autoRoleID = "1352745816409767958";
  const welcomeChannelID = "1352762813185134632";
  const role = member.guild.roles.cache.get(autoRoleID);
  const welcomeChannel = member.guild.channels.cache.get(welcomeChannelID);

  const currentTime = Date.now();
  let joinTimesList = joinTimes.get(member.guild.id) || [];
  joinTimesList = joinTimesList.filter((time) => currentTime - time < 10000);
  joinTimesList.push(currentTime);
  joinTimes.set(member.guild.id, joinTimesList);

  if (joinTimesList.length > raidThreshold) {
    try {
      await member.timeout(60000, "Antaget raid aktivitet");
      await member.send(
        "Serveren har muligvis været under angreb. Din adgang er midlertidigt begrænset.",
      );
      logToChannel(
        `**Raid forsøg af:** ${member.user.tag} | Timeout i 1 minut.`,
      );
    } catch (error) {
      console.error("Fejl ved anti-raid timeout:", error);
    }
    return;
  }

  if (role) await member.roles.add(role);
  if (welcomeChannel) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#04a879")
      .setTitle("Velkommen til Fivebox!")
      .setDescription(
        `Velkommen <@${member.user.id}> til **${member.guild.name}**!`,
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    welcomeChannel.send({ embeds: [welcomeEmbed] });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const messageContent = message.content.toLowerCase();
  for (let word of blacklistedWords) {
    if (messageContent.includes(word)) {
      try {
        await message.member.timeout(3600000, "Bruger anvendte sort ord");
        await message.author.send(
          "Hej! Du er blevet timeoutet i 1 time for at bruge et upassende ord. Overhold venligst reglerne.",
        );
        logToChannel(
          `**Bruger timeoutet:** ${message.author.tag} | Brugte sort ord: "${word}".`,
        );
      } catch (error) {
        console.error("Fejl ved timeout af bruger:", error);
      }

      await message.delete();
      return;
    }
  }

  const currentTime = Date.now();
  const userMessages = spamCooldowns.get(message.author.id) || [];
  const filteredMessages = userMessages.filter(
    (msg) => currentTime - msg < 10000,
  );
  filteredMessages.push(currentTime);
  spamCooldowns.set(message.author.id, filteredMessages);

  if (filteredMessages.length > spamLimit) {
    try {
      await message.member.timeout(300000, "Spam");
      await message.delete();
      logToChannel(`**Bruger timeoutet for spam:** ${message.author.tag}.`);
    } catch (error) {
      console.error("Fejl ved timeout af bruger:", error);
    }
  }
});

const cooldowns = new Map();
const activeTickets = new Map();
const orderNumberFile = "./orderNumber.json";

const getOrderNumber = () => {
  try {
    const data = fs.readFileSync(orderNumberFile);
    const parsedData = JSON.parse(data);
    return parsedData.orderNumber || 1;
  } catch (err) {
    return 1;
  }
};

const saveOrderNumber = (orderNumber) => {
  fs.writeFileSync(orderNumberFile, JSON.stringify({ orderNumber }));
};

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (
    message.author.id === config.modmail.ownerID &&
    message.content.toLowerCase().startsWith("!ticket")
  ) {
    message.delete();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("support")
        .setLabel("Support Ticket")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("premium")
        .setLabel("Købs Ticket")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("sporgsmal")
        .setLabel("Spørgsmål Ticket")
        .setStyle(ButtonStyle.Success),
    );

    const ticketmsg = new EmbedBuilder()
      .setTitle(`${message.guild.name} | Ticket System`)
      .setDescription("Klik på en knap herunder for at oprette en ticket.")
      .setColor("#2e2e2e");

    message.channel.send({ embeds: [ticketmsg], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.user.id;
  const currentTime = Date.now();

  if (activeTickets.has(userId)) {
    return interaction.reply({
      content: `Du har allerede en aktiv ticket.`,
      ephemeral: true,
    });
  }

  const userCooldown = cooldowns.get(userId) || 0;
  if (userCooldown > currentTime) {
    const remainingTime = Math.ceil((userCooldown - currentTime) / 1000);
    return interaction.reply({
      content: `Vent ${remainingTime} sekunder før du opretter en ny ticket.`,
      ephemeral: true,
    });
  }

  let currentOrderNumber = getOrderNumber();
  const generatedOrderNumber = currentOrderNumber;
  currentOrderNumber++;
  saveOrderNumber(currentOrderNumber);

  let categoryId = config.modmail.supportId;
  if (interaction.customId === "premium") categoryId = "1352037462955786260";
  if (interaction.customId === "sporgsmal") categoryId = "1352303490889678979";

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Luk Ticket")
      .setCustomId("close_ticket")
      .setStyle(ButtonStyle.Danger),
  );

  const ticketChannel = await interaction.guild.channels.create({
    name: `ticket-${interaction.user.username}-${generatedOrderNumber}`,
    type: ChannelType.GuildText,
    parent: categoryId,
    permissionOverwrites: [
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        id: config.modmail.whitelist,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
    ],
  });

  const ticketEmbed = new EmbedBuilder()
    .setTitle(`Ticket #${generatedOrderNumber}`)
    .setDescription(
      `**Ordrenummer:** __#${generatedOrderNumber}__\n\nBeskriv venligst dit problem herunder.`,
    )
    .setColor("#2e73d4")
    .setFooter({
      text: `Oprettet af ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setTimestamp();

  await ticketChannel.send({ embeds: [ticketEmbed], components: [closeRow] });

  const logEmbed = new EmbedBuilder()
    .setTitle("Ny Ticket Oprettet")
    .setColor("#FF5733")
    .setDescription(
      `**Ordrenummer:** ${generatedOrderNumber}\n**Bruger:** <@${userId}>\n**Kategori:** ${interaction.customId}\n**Kanal:** <#${ticketChannel.id}>`,
    )
    .setTimestamp();

  await client.channels.cache
    .get("1352038401381236777")
    .send({ embeds: [logEmbed] });

  activeTickets.set(userId, { channelId: ticketChannel.id });
  cooldowns.set(userId, currentTime + 60 * 1000);
  await interaction.reply({
    content: `<#${ticketChannel.id}> er oprettet!`,
    ephemeral: true,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    const ticketChannel = interaction.channel;
    await ticketChannel.delete();

    const logEmbed = new EmbedBuilder()
      .setTitle("Ticket Lukket")
      .setColor("#FF5733")
      .setDescription(
        `**Bruger:** ${interaction.user.tag}\n**Ticket Kanal:** <#${ticketChannel.id}>`,
      )
      .setTimestamp();

    await client.channels.cache
      .get("1352038401381236777")
      .send({ embeds: [logEmbed] });
  }
});

client.once("ready", () => {
  console.log(`${client.user.username} er klar!`);
});

client.login(process.env.TOKEN);

const logToChannel = async (logMessage) => {
  const logEmbed = new EmbedBuilder()
    .setTitle("Log Hændelse")
    .setColor("#FF5733")
    .setDescription(logMessage)
    .setTimestamp();

  await client.channels.cache
    .get("1352038401381236777")
    .send({ embeds: [logEmbed] });
};
