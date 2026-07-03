<template>
  <SettingsFormPage :page="page" />
</template>

<script>
import SettingsFormPage from "./SettingsFormPage.vue";

export default {
  name: "PlantSetting",
  components: { SettingsFormPage },
  data() {
    return {
      page: {
        title: "Plant Info.",
        rows: [
          { label: "Plant name", type: "input", value: "" },
          { label: "Plant address", type: "input", value: "" },
          { label: "Plant owner", type: "input", value: "" },
          { label: "Plant owner address", type: "input", value: "" },
          { label: "Country/Region", type: "select", value: "VN(Viet Nam)", options: ["VN(Viet Nam)", "TH(Thailand)", "ID(Indonesia)", "MY(Malaysia)"] },
        ],
      },
    };
  },
};
</script>
