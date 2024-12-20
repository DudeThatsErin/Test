const path = require('path');
const {filterCompletedEvents, determineMostSevereStatus} = require(path.join(__basedir, 'dummy/config/reused-functions.js'));

module.exports = {
    name: 'qcheck',
    description: 'Quick check of service status.',
    execute(interaction) {

// Function for quick service check
  console.log("Quick checking service status from local file...");
  try {
    const data = fs.readFile("service_status.json", "utf8");
    const response = JSON.parse(data);
    const services = response.services.filter((service) => {
      // Filter out completed or resolved events
      const ongoingEvents = service.events.filter(
        (event) =>
          event.eventStatus === "ongoing" || event.eventStatus === "upcoming"
      );
      // Filter out events with the same messageId that are completed or resolved
      const filteredEvents = filterCompletedEvents(ongoingEvents);
      return filteredEvents.length > 0;
    });
    const { embedColor, mostSevereStatus } =
      determineMostSevereStatus(services);
    let embed = new EmbedBuilder()
      .setColor(embedColor) // Set embed color based on the most severe status
      .setTitle("Quick check report of service status:");

    // Separate arrays for each status
    const outages = [],
      issue = [],
      performance = [],
      maintenance = [];

    services.forEach((service) => {
      const ongoingEvents = service.events.filter(
        (event) =>
          event.eventStatus === "ongoing" || event.eventStatus === "upcoming"
      );
      // Filter out completed or resolved events within the same messageId
      const filteredEvents = filterCompletedEvents(ongoingEvents);
      filteredEvents.forEach((event) => {
        let status = `**${event.statusType}**`;
        if (event.startDate) {
          status += `\n**Start**: ${event.startDate}`;
          if (
            (event.endDate && event.eventStatus === "ongoing") ||
            (!event.endDate && event.eventStatus === "ongoing")
          ) {
            status += ` - ongoing`;
          }
        }
        if (event.endDate && event.eventStatus !== "ongoing") {
          status += `\n**End**: ${event.endDate}`;
        }
        if (event.usersAffected) {
          status += `\n**Users Affected**: ${event.usersAffected}`;
        }
        if (event.message) {
          status += `\n**Description**: ${
            event.message || "No additional details."
          }`;
        }

        switch (event.statusType) {
          case "Maintenance":
            emoji = "🟠";
            maintenance.push({
              name: service.serviceName,
              value: `${emoji} ${status}`,
              inline: false,
            });
            break;
          case "Performance":
            emoji = "🟡";
            performance.push({
              name: service.serviceName,
              value: `${emoji} ${status}`,
              inline: false,
            });
            break;
          case "Issue":
            emoji = "🟡";
            issue.push({
              name: service.serviceName,
              value: `${emoji} ${status}`,
              inline: false,
            });
            break;
          case "Outage":
            emoji = "🔴";
            outages.push({
              name: service.serviceName,
              value: `${emoji} ${status}`,
              inline: false,
            });
            break;
        }
      });
    });

    // Adding fields in the order of Outages, Issues, and Maintenances
    if (outages.length > 0) embed.addFields(outages);
    if (issue.length > 0) embed.addFields(issue);
    if (performance.length > 0) embed.addFields(performance);
    if (maintenance.length > 0) embed.addFields(maintenance);

    if (!embed.data.fields || embed.data.fields.length === 0) {
      embed.setDescription("**🟢 All services are up.**");
    }

    interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Error quick checking service status:", error);
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xf8312f)
          .setTitle("Quick check report of service status:")
          .setDescription("Error fetching service status."),
      ],
    });
  }

    }
}