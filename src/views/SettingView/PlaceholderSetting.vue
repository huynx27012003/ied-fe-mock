<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "PlaceholderSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Settings",
        rows: [
          { label: "Status", type: "text", value: "Mock page is not configured." },
        ],
      },
    };
  },
};
</script>
