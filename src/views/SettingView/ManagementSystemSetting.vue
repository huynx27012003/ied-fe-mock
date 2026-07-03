<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "ManagementSystemSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Basic parameters",
        tabLabel: "Management System",
        rows: [
          { label: "Server", type: "select", value: "intl.fusionsolar.huawei.com", options: ["intl.fusionsolar.huawei.com", "intl-backup.fusionsolar.huawei.com"] },
          { label: "Port", type: "input", value: "27250", hint: "[1,65535]" },
          { label: "Network port", type: "select", value: "Ethernet1", options: ["Ethernet1", "Ethernet2"] },
          { label: "Address mode", type: "select", value: "Logical address", options: ["Logical address", "Physical address"] },
          { label: "TLS encryption", type: "select", value: "Enable", options: ["Enable", "Disable"] },
          { label: "TLS version", type: "select", value: "TLS 1.2 or later", options: ["TLS 1.2 or later", "TLS 1.3"] },
          { label: "Second challenge authentication", type: "select", value: "Enable", options: ["Enable", "Disable"], button: "Resetting the authentication password" },
          { label: "NMS connection status", type: "text", value: "Connected" },
        ],
        collapsed: ["Security Certificate"],
      },
    };
  },
};
</script>
