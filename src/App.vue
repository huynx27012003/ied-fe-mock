<template>
  <div v-if="appReady" id="app">
    <nav class="p-4 bg-green-600 text-white">
      <router-link to="/" class="mr-4" exact></router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "App",
  computed: {
    ...mapState(["isAuthenticated", "user"]),
    appReady() {
      return this.isAuthenticated === false || this.user !== null;
    },
  },
};
</script>
<style>
:root {
  --popup-glass-bg: linear-gradient(
    145deg,
    rgba(250, 254, 255, 0.9),
    rgba(242, 248, 255, 0.86)
  );
  --popup-glass-border: rgba(166, 194, 229, 0.65);
}

.el-message {
  top: 60px !important;
}

.el-overlay {
  background: rgba(14, 31, 61, 0.18) !important;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.el-dialog,
.el-overlay .el-dialog,
.el-message-box,
.el-dropdown-menu,
.context-menu,
.submenu {
  background: var(--popup-glass-bg) !important;
  border: 1px solid var(--popup-glass-border) !important;
  backdrop-filter: blur(10px) saturate(118%);
  -webkit-backdrop-filter: blur(10px) saturate(118%);
  box-shadow: 0 8px 18px rgba(15, 45, 92, 0.14) !important;
}

.el-dialog,
.el-message-box,
.el-dropdown-menu,
.context-menu,
.submenu {
  border-radius: 12px !important;
}

.el-dialog__header,
.el-message-box__header {
  background: transparent !important;
  border-bottom: none !important;
}

.el-dialog__footer {
  background: rgba(255, 255, 255, 0.18) !important;
  border-top: 1px solid rgba(176, 203, 233, 0.45) !important;
}

.viewport-dialog-overlay .el-overlay-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 12px;
  overflow: hidden !important;
}

.viewport-dialog-overlay .el-dialog {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 24px);
  margin: 0 !important;
  overflow: hidden;
}

.viewport-dialog-overlay .viewport-fit-dialog {
  max-width: calc(100vw - 24px);
}

.viewport-dialog-overlay .el-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-height: 640px) {
  .viewport-dialog-overlay .el-overlay-dialog {
    padding: 8px;
  }

  .viewport-dialog-overlay .el-dialog {
    max-height: calc(100vh - 16px);
  }
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow-y: hidden; /* ẩn thanh cuộn dọc toàn trang */
}

#app {
  height: 100%;
}
</style>
