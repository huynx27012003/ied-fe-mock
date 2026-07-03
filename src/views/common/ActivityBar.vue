<template>
  <div class="activity-bar">
    <div class="activity-bar-top">
      <ActivityBarItem
        v-for="item in topItems"
        :key="item.id"
        :icon="item.icon"
        :title="item.title"
        :active="activeView === item.id"
        @click="handleTopClick(item)"
      />
    </div>

    <div class="activity-bar-bottom">
      <WhatsNewDrawer ref="whatsNewDrawer" />
      <HelpCenter @open-whats-new="openWhatsNew" />
    </div>
  </div>
</template>

<script>
import ActivityBarItem from './activity-bar/ActivityBarItem.vue';
import HelpCenter from './activity-bar/HelpCenter.vue';
import WhatsNewDrawer from './activity-bar/WhatsNewDrawer.vue';

export default {
  name: 'ActivityBar',
  components: {
    ActivityBarItem,
    HelpCenter,
    WhatsNewDrawer
  },
  props: {
    activeView: {
      type: String,
      default: 'explorer'
    },
  },
  emits: ['view-change'],
  computed: {
    topItems() {
      return [
        {
          id: 'overview',
          icon: 'fa-solid fa-chart-line',
          title: 'Overview'
        },
        {
          id: 'explorer',
          icon: 'fa-solid fa-folder-tree',
          title: 'Monitoring'
        },
        {
          id: 'setting',
          icon: 'fa-solid fa-gear',
          title: 'Setting'
        }
      ];
    }
  },
  methods: {
    handleTopClick(item) {
      this.$emit('view-change', item.id);
    },
    openWhatsNew() {
      this.$refs.whatsNewDrawer?.open?.();
    }
  }
};
</script>

<style scoped>
.activity-bar {
  width: 48px;
  min-width: 48px;
  height: 100%;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  background-attachment: fixed;
  background-size: 100% 100vh;
  background-position: 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: none;
  z-index: 10000;
}

.activity-bar-top,
.activity-bar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
}

.activity-bar-top {
  padding-top: 10px;
}
</style>
