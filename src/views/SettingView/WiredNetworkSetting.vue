<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "WiredNetworkSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Network Port Configuration",
        rows: [
          { label: "WAN/LAN/SFP1/SFP2", type: "input", value: "Ethernet1/Ethernet2/Ethernet1/Ethernet2" },
        ],
        sections: [
          {
            title: "Ethernet1-WAN/SFP1/SFP2",
            rows: [
              { label: "DHCP", type: "text", value: "Disable (Set it using the app.)" },
              { label: "IP address", type: "input", value: "192 . 168 . 0 . 10" },
              { label: "Subnet mask", type: "input", value: "255 . 255 . 255 . 0" },
              { label: "Default gateway", type: "input", value: "192 . 168 . 0 . 1" },
              { label: "Primary DNS server", type: "input", value: "192 . 168 . 0 . 1" },
              { label: "Secondary DNS server", type: "input", value: "0 . 0 . 0 . 0" },
            ],
          },
          {
            title: "Ethernet2-LAN",
            rows: [
              { label: "IP address", type: "input", value: "192 . 168 . 8 . 10" },
              { label: "Subnet mask", type: "input", value: "255 . 255 . 255 . 0" },
            ],
          },
        ],
      },
    };
  },
};
</script>
