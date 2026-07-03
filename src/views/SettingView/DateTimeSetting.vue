<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "DateTimeSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Date&Time",
        rows: [
          { label: "Time zone", type: "select", value: "(UTC+07:00) Bangkok", options: ["(UTC+07:00) Bangkok", "(UTC+08:00) Beijing", "(UTC+00:00) UTC"] },
          { label: "Date", type: "input", value: "2026-07-03", hint: "(YYYY-MM-DD)" },
          { label: "Time", type: "input", value: "09:09:40", hint: "(HH:MM:SS)" },
          { label: "Clock source", type: "select", value: "Management System", options: ["Management System", "NTP", "Manual"] },
          { label: "Synchronization server", type: "text", value: "intl.fusionsolar.huawei.com" },
          { label: "Latest synchronization time", type: "text", value: "2026-06-23 09:53:29" },
        ],
      },
    };
  },
};
</script>
