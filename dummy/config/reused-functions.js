const Discord = require('discord.js');

// Helper function to create embeds
function createServiceStatusEmbed(services, includeTitle) {
  const embed = new EmbedBuilder();

  let mostSevereStatus = 0; // 0 for all "Up", 1 for Maintenance, 2 for Performance/Issue, 3 for Outage

  services.forEach((service) => {
    let statusEmoji = "🟢"; // Default to "Up"
    let statusText = "**Up**"; // Default text
    let additionalInfo = ""; // Initialize without additional info

    if (service.events.length > 0) {
      const eventStatus = service.events[0].eventStatus;
      const statusType = service.events[0].statusType;

      if (eventStatus !== "completed" && eventStatus !== "resolved") {
        switch (statusType) {
          case "Outage":
            statusEmoji = "🔴";
            statusText = "**Outage**";
            mostSevereStatus = Math.max(mostSevereStatus, 3); // Set severity to the highest level
            break;
          case "Issue":
            statusEmoji = "🟡";
            statusText = "**Issue**";
            mostSevereStatus = Math.max(mostSevereStatus, 2); // Set severity
            break;
          case "Performance":
            statusEmoji = "🟡";
            statusText = "**Performance**";
            mostSevereStatus = Math.max(mostSevereStatus, 2); // Set severity
            break;
          case "Maintenance":
            statusEmoji = "🟠";
            statusText = "**Maintenance**";
            mostSevereStatus = Math.max(mostSevereStatus, 1); // Set severity
            break;
        }

        // Add additional event info (like start/end dates, etc.)
        if (service.events[0].startDate) {
          additionalInfo += `\n**Start**: ${service.events[0].startDate}`;
          if (eventStatus === "ongoing") {
            additionalInfo += " - ongoing";
          }
        }
        
        if (service.events[0].endDate && eventStatus !== "ongoing") {
          additionalInfo += `\n**End**: ${service.events[0].endDate}`;
        }

        additionalInfo += service.events[0].usersAffected
          ? `\n**Users Affected**: ${service.events[0].usersAffected}`
          : "";

        additionalInfo += service.events[0].message
          ? `\n**Description**: ${service.events[0].message}`
          : "";
      }
    }

    embed.addFields({
      name: service.serviceName,
      value: `${statusEmoji} ${statusText}${additionalInfo}`,
      inline: true,
    });
  });

  // Determine the embed color based on the most severe status
  let embedColor = 0xffffff; // Default to white (if all services are up)
  switch (mostSevereStatus) {
    case 1:
      embedColor = 0xffa500; // Orange for Maintenance
      break;
    case 2:
      embedColor = 0xffff00; // Yellow for Performance/Issue
      break;
    case 3:
      embedColor = 0xff0000; // Red for Outage
      break;
  }

  embed.setColor(embedColor); // Apply the determined color

  if (includeTitle) {
    embed.setTitle("Current Service Status");
  }

  return embed;
}

// Helper function to filter out completed or resolved events within the same messageId
function filterCompletedEvents(events) {
  const messageIdMap = new Map();
  events.forEach((event) => {
    const messageId = event.messageId;
    if (!messageIdMap.has(messageId)) {
      messageIdMap.set(messageId, event);
    } else {
      const existingEvent = messageIdMap.get(messageId);
      if (
        existingEvent.eventStatus !== "completed" &&
        existingEvent.eventStatus !== "resolved"
      ) {
        messageIdMap.set(messageId, event);
      }
    }
  });
  return Array.from(messageIdMap.values());
}

// Helper function to determine the most severe status and embed color
function determineMostSevereStatus(services) {
  let mostSevereStatus = 0;
  services.forEach((service) => {
    service.events.forEach((event) => {
      if (event.eventStatus === "ongoing" || event.eventStatus === "upcoming") {
        switch (event.statusType) {
          case "Maintenance":
            mostSevereStatus = Math.max(mostSevereStatus, 1);
            break;
          case "Performance":
          case "Issue":
            mostSevereStatus = Math.max(mostSevereStatus, 2);
            break;
          case "Outage":
            mostSevereStatus = Math.max(mostSevereStatus, 4);
            break;
        }
      }
    });
  });

  let embedColor;
  switch (mostSevereStatus) {
    case 1: // Maintenance
      embedColor = 0xff6723; // Orange for Maintenance
      break;
    case 2: // Performance or Issue
      embedColor = 0xfcd53f; // Yellow for Performance or Issue
      break;
    case 4: // Outage
      embedColor = 0xf8312f; // Red for Outage
      break;
    default: // All services are up
      embedColor = 0x03ba5f; // Green for up
  }
  return { embedColor, mostSevereStatus };
}



// Helper function to filter out completed or resolved events within the same messageId
function filterCompletedEvents(events) {
  const messageIdMap = new Map();
  events.forEach((event) => {
    const messageId = event.messageId;
    if (!messageIdMap.has(messageId)) {
      messageIdMap.set(messageId, event);
    } else {
      const existingEvent = messageIdMap.get(messageId);
      if (
        existingEvent.eventStatus !== "completed" &&
        existingEvent.eventStatus !== "resolved"
      ) {
        messageIdMap.set(messageId, event);
      }
    }
  });
  return Array.from(messageIdMap.values());
}

// Helper function to determine the most severe status and embed color
function determineMostSevereStatus(services) {
  let mostSevereStatus = 0;
  services.forEach((service) => {
    service.events.forEach((event) => {
      if (event.eventStatus === "ongoing" || event.eventStatus === "upcoming") {
        switch (event.statusType) {
          case "Maintenance":
            mostSevereStatus = Math.max(mostSevereStatus, 1);
            break;
          case "Performance":
          case "Issue":
            mostSevereStatus = Math.max(mostSevereStatus, 2);
            break;
          case "Outage":
            mostSevereStatus = Math.max(mostSevereStatus, 4);
            break;
        }
      }
    });
  });

  let embedColor;
  switch (mostSevereStatus) {
    case 1: // Maintenance
      embedColor = 0xff6723; // Orange for Maintenance
      break;
    case 2: // Performance or Issue
      embedColor = 0xfcd53f; // Yellow for Performance or Issue
      break;
    case 4: // Outage
      embedColor = 0xf8312f; // Red for Outage
      break;
    default: // All services are up
      embedColor = 0x03ba5f; // Green for up
  }
  return { embedColor, mostSevereStatus };
}

module.exports = { determineMostSevereStatus, filterCompletedEvents, createServiceStatusEmbed };