const { Client, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, GatewayIntentBits, Partials, time, PermissionsBitField, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction,
        Partials.ThreadMember
    ]
});

  // Host the bot:
  require('http')
    .createServer((req, res) => res.end(''))
    .listen(3030);

  client.once('ready', () => {
    console.log(client.user.username + ' is ready!');
    console.log('== The logs are starting from here ==');
  });

const config = require("./config.js");
const owner = config.modmail.ownerID
const supportcat = config.modmail.supportId
const premiumcat = config.modmail.premiumId
const whitelistrole = config.modmail.whitelist
const staffID = config.modmail.staff
const log = config.logs.logschannel;
const cooldowns = new Map(); // Map to track cooldowns

client.on("messageCreate", async (message) => {
  if (message.author.id === owner) {
    if (message.content.toLowerCase().startsWith("!ticket-embed")) {
      message.delete();
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel("📨 Support")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("support"),
          new ButtonBuilder()
            .setLabel("💸 Premium")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId("premium")
        );

      const ticketmsg = new EmbedBuilder()
        .setTitle(`${message.guild.name}'s Ticket System`)
        .setDescription(
          `**Welcome to our Support Ticket System!** 🎫

*To ensure prompt assistance, please click on one of the buttons below to open a ticket in the category that best fits your inquiry. Our dedicated support team is ready to help you with any questions or issues you may encounter. Choose the appropriate category, and we'll get back to you as soon as possible.*

🚀 **General Inquiry:** For general questions or information.

🛠️ **Premium Support:** Inquire about one of our products or services.

*Thank you for reaching out to us! Your satisfaction is our priority.*`
        )
        .setFooter({ text: `${message.guild.name} | Made with ❤️ by sparks.js`, iconURL: message.guild.iconURL() })
        .setColor("#842abe");

      message.channel.send({
        embeds: [ticketmsg],
        components: [row],
      });
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      const userId = interaction.user.id;
      const userCooldown = cooldowns.get(userId) || 0;
      const currentTime = Date.now();

      if (userCooldown > currentTime && (interaction.customId === "support" || interaction.customId === "premium")) {
        const remainingTime = Math.ceil((userCooldown - currentTime) / 1000);
        interaction.reply({
          content: `You're on a cooldown. Please wait ${remainingTime} seconds before opening another ticket.`,
          ephemeral: true,
        });
        return;
      }

      if (interaction.customId === "support" || interaction.customId === "premium") {
        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("⚙️ Manage")
            .setCustomId("close")
            .setStyle(ButtonStyle.Primary)
        );

        const supportmsg = new EmbedBuilder()
          .setTitle(`${interaction.user.displayName}'s Support Ticket`)
          .setDescription(
            "**Hello!**\nPlease provide a detailed description of your query, and one of our team members will assist you shortly."
          )
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setColor("#2a043b");

        const premiummsg = new EmbedBuilder()
          .setTitle(`${interaction.user.displayName}'s Premium Ticket`)
          .setDescription(
            "**Hello there!**\nNeed assistance with our premium features? Feel free to share details about your inquiry, and our team will get back to you shortly. Your satisfaction is our priority!"
          )
          .setFooter({ text: `User ID: ${interaction.user.id}` })
          .setColor("#2a043b");

        if (interaction.customId === "support") {
          const ticket = await interaction.guild.channels.create({
            name: `ticket ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: supportcat,
            permissionOverwrites: [
              {
                id: interaction.user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              },
              {
                id: whitelistrole,
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

          interaction.reply({
            content: `<#${ticket.id}> has been made for you under General Support Category.`,
            ephemeral: true,
          });
          
client.channels.cache.get(log).send(`# New Ticket\n\n**User:** <@${interaction.user.id}> opened <#${ticket.id}> under General Support Category!`);
          ticket.send({
            content: `<@&${staffID}>\n**==========================**`,
            embeds: [supportmsg],
            components: [row2],
          });

          // Set cooldown for the user (2 hours in milliseconds)
          cooldowns.set(userId, currentTime + 2 * 60 * 60 * 1000);
        }

        if (interaction.customId === "premium") {
          const ticket = await interaction.guild.channels.create({
            name: `ticket ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: premiumcat,
            permissionOverwrites: [
              {
                id: interaction.user.id,
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              },
              {
                id: whitelistrole,
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

          interaction.reply({
            content: `<#${ticket.id}> has been made for you under Premium Services Category.`,
            ephemeral: true,
          });
          
client.channels.cache.get(log).send(`# New Ticket\n\n**User:** <@${interaction.user.id}> opened <#${ticket.id}> under Premium Support Category!`);
          ticket.send({
            content: `<@&${staffID}>\n**==========================**`,
            embeds: [premiummsg],
            components: [row2],
          });

          // Set cooldown for the user (2 hours in milliseconds)
          cooldowns.set(userId, currentTime + 2 * 60 * 60 * 1000);
        }
      } else if (interaction.customId === "close") {
        // Check if the user has the whitelisted role
        const guild = interaction.guild;
        const member = guild.members.cache.get(userId);

        if (!member.roles.cache.has(whitelistrole)) {
          // User is not whitelisted, send an ephemeral message
          interaction.reply({
            content: "You are not whitelisted to perform this action.",
            ephemeral: true,
          });
          return;
        }

        const deleteButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("🗑️ Delete")
              .setCustomId("delete")
              .setStyle(ButtonStyle.Danger)
          );

        const close2Button = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setLabel("🔒 Close")
              .setCustomId("close2")
              .setStyle(ButtonStyle.Primary)
          );

        interaction.update({ content: `<@${interaction.user.id}> **Please click on either of the following button.**`, components: [deleteButton, close2Button] });
      } else if (interaction.customId === "delete") {
        // Delete the channel
        const channel = interaction.channel;
        channel.delete()
          .then(() => {
            interaction.reply("Ticket channel deleted.");
            client.channels.cache.get(log).send(`# Ticket Deleted\n\n**User:** <@${interaction.user.id}> deleted a ticket.`);
          })
          .catch(console.error);
      } else if (interaction.customId === "close2") {
        interaction.channel.permissionOverwrites.set([
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          }
        ]);
        interaction.reply(`<@${interaction.user.id}> closed the ticket.`);
  client.channels.cache.get(log).send(`# Ticket Closed\n\n**User:** <@${interaction.user.id}> closed a ticket.`);
      }
    }
  } catch (e) {
    console.log(e);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.content.toLowerCase() === `!setup`) {
    // Create General Tickets category
    const generalTicketsCategory = await message.guild.channels.create({
      name: 'General Tickets',
      type: ChannelType.GuildCategory,
    });

    // Create Premium Tickets category
    const premiumTicketsCategory = await message.guild.channels.create({
      name: 'Premium Tickets',
      type: ChannelType.GuildCategory,
    });

    // Create Ticket Logs category
    const ticketLogsCategory = await message.guild.channels.create({
      name: 'Logs', 
      type: ChannelType.GuildCategory,
    });

    // Create a channel inside Ticket Logs category named 'ticket-logs'
    const ticket = await message.guild.channels.create({
      name: `ticket logs`,
      type: ChannelType.GuildText,
      parent: ticketLogsCategory,
      permissionOverwrites: [
        {
          id: message.author.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: whitelistrole,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: message.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
      });

    // Reply to the user in the channel where the command was received
    message.channel.send('Ticket setup completed!');
  }
});

client.login(process.env.TOKEN);