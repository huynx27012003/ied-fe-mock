<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "Rs485Setting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "RS485",
        table: {
          columns: ["RS485", "Protocol", "Baud rate", "Parity", "Stop Bit", "Start address", "End address"],
          rows: [
            ["COM1", "Modbus", "9600", "None", "1", "1", "247"],
            ["COM2", "Modbus", "9600", "None", "1", "1", "247"],
            ["COM3", "Modbus", "9600", "None", "1", "1", "247"],
          ],
        },
        collapsed: ["Night Communication Settings"],
      },
    };
  },
};
</script>
