<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "WirelessNetworkSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "WLAN",
        rows: [
          { label: "WLAN", type: "select", value: "OFF in idle state", options: ["OFF in idle state", "Enable", "Disable"] },
          { label: "SSID", type: "input", value: "Logger_10255D152736" },
          { label: "Password", type: "password", value: "12345678", hint: "'a~z','A~Z','0~9'(8-19 characters, at least two types of characters)" },
        ],
      },
    };
  },
};
</script>
