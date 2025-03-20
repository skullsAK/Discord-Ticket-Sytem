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

require("http")
  .createServer((req, res) => res.end("Bot kører"))
  .listen(3030);

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

client.once("ready", () => {
  console.log(`${client.user.username} er klar!`);
});

const cooldowns = new Map();
const activeTickets = new Map();

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
      .setDescription(`Klik på en knap herunder for at oprette en ticket.`)
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() })
      .setColor("#2e2e2e"); // Mørk baggrund hele vejen

    message.channel.send({ embeds: [ticketmsg], components: [row] });
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      const userId = interaction.user.id;
      const currentTime = Date.now();

      if (
        interaction.customId === "support" ||
        interaction.customId === "premium" ||
        interaction.customId === "sporgsmal"
      ) {
        if (activeTickets.has(userId)) {
          return interaction.reply({
            content: `Du har allerede en aktiv ticket. Luk den før du laver en ny.`,
            ephemeral: true,
          });
        }

        const userCooldown = cooldowns.get(userId) || 0;
        if (userCooldown > currentTime) {
          const remainingTime = Math.ceil((userCooldown - currentTime) / 1000);
          return interaction.reply({
            content: `Vent venligst ${remainingTime} sekunder før du opretter en ny ticket.`,
            ephemeral: true,
          });
        }

        let currentOrderNumber = getOrderNumber();
        const generatedOrderNumber = currentOrderNumber;
        currentOrderNumber++;
        saveOrderNumber(currentOrderNumber);

        let categoryId = config.modmail.supportId;
        if (interaction.customId === "premium")
          categoryId = "1352037462955786260";
        if (interaction.customId === "sporgsmal")
          categoryId = "1352303490889678979";

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
            `**Ordrenummer:**\n\n**__#${generatedOrderNumber}__**\n\nBeskriv venligst dit problem herunder.`,
          )
          .setColor("#2e73d4")
          .setFooter({
            text: `Oprettet af ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        await ticketChannel.send({
          embeds: [ticketEmbed],
          components: [closeRow],
        });

        const logEmbed = new EmbedBuilder()
          .setTitle("Ny Ticket Oprettet")
          .setColor("#FF5733")
          .setDescription(
            `**Ordrenummer:** ${generatedOrderNumber}\n**Bruger:** <@${userId}>\n**Kategori:** ${interaction.customId}\n**Kanal:** <#${ticketChannel.id}>`,
          )
          .setTimestamp();

        await client.channels.cache
          .get(config.logs.logschannel)
          .send({ embeds: [logEmbed] });

        activeTickets.set(userId, { channelId: ticketChannel.id });
        cooldowns.set(userId, currentTime + 60 * 1000);

        await interaction.reply({
          content: `<#${ticketChannel.id}> er oprettet.`,
          ephemeral: true,
        });
      }

      if (interaction.customId === "close_ticket") {
        const ticketChannel = interaction.channel;
        const ticketOwner = [...activeTickets.entries()].find(
          ([_, data]) => data.channelId === ticketChannel.id,
        );

        if (
          interaction.user.id === ticketOwner?.[0] ||
          interaction.member.permissions.has(
            PermissionsBitField.Flags.ManageChannels,
          )
        ) {
          if (ticketOwner) activeTickets.delete(ticketOwner[0]);

          await interaction.reply({
            content: "Ticket lukkes...",
            ephemeral: true,
          });
          setTimeout(() => {
            ticketChannel.delete().catch(console.error);
          }, 3000);
        } else {
          await interaction.reply({
            content: "Du har ikke tilladelse til at lukke denne ticket.",
            ephemeral: true,
          });
        }
      }
    }
  } catch (error) {
    console.error("Fejl ved håndtering af interaktion:", error);
  }
});

client.login(process.env.TOKEN);
