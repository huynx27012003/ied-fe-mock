<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "ModbusTcpSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Modbus TCP",
        help: true,
        rows: [
          { label: "Link setting", type: "select", value: "Enable(Unlimited)", options: ["Enable(Unlimited)", "Disable"] },
          { label: "Address mode", type: "select", value: "Logical address", options: ["Logical address", "Physical address"] },
          { label: "Logger address", type: "input", value: "0", hint: "[0, 247]" },
          { label: "Fast scheduling", type: "select", value: "Enable", options: ["Enable", "Disable"] },
          { label: "LAN port", type: "select", value: "Disable", options: ["Disable", "Enable"] },
        ],
        collapsed: ["Extended Parameters"],
      },
    };
  },
};
</script>
