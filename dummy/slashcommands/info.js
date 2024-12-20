const axios = require("axios");

module.exports = {
    name: 'info',
    description: 'Fetch Apple OS version information',
    options: [
        {
            name: 'os',
            description: 'The operating system (e.g., iOS, macOS, visionOS)',
            required: true,
            type: 3
        },
        {
            name: 'version',
            description: 'The OS version to look up (e.g., 18.0)',
            required: true,
            type: 3
        }
    ],
    execute(interaction) {

    const os = interaction.options.getString("os");
    const version = interaction.options.getString("version");

    const axiosInstance = axios.create({
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false, // Disable certificate validation
      }),
    });

    try {
      // Fetch the Apple updates JSON
      const response = axiosInstance.get("https://gdmf.apple.com/v2/pmv");

      // Get the data for the specified OS
      const osData = response.data.PublicAssetSets[os];

      if (!osData) {
        interaction.reply({
          content: `No information found for the operating system **${os}**.`,
          ephemeral: true,
        });
        return;
      }

      // Find the specific version
      const versionInfo = osData.find((item) => item.ProductVersion === version);

      if (!versionInfo) {
        interaction.reply({
          content: `No information found for version **${version}** of **${os}**.`,
          ephemeral: true,
        });
        return;
      }

      const { Build, PostingDate, Assets } = versionInfo;

      // Calculate total size of assets (if applicable)
      const totalSize = Assets?.reduce((sum, asset) => sum + asset.size, 0) || 0;

      // Convert size to human-readable format
      const formatSize = (bytes) => {
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        if (bytes === 0) return "0 Bytes";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
      };

      const sizeDisplay = formatSize(totalSize);

      // Create an embed with the version details
      const embed = new EmbedBuilder()
        .setTitle(`OS Version Info: ${os} ${version}`)
        .addFields(
          { name: "Build", value: Build, inline: true },
          { name: "Release Date", value: new Date(PostingDate).toLocaleDateString(), inline: true },
          { name: "Size", value: sizeDisplay, inline: true }
        )
        .setColor(0x00ff00)
        .setFooter({ text: "Data from Apple's Pallas (OTA) Server" });

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Error fetching OS version info:", error);
      interaction.reply({
        content: "Failed to fetch version information. Please try again later.",
        ephemeral: true,
      });
    }

    }
}