<template>
  <div v-if="visible" class="context-menu-wrapper" v-bind="$attrs">
    <Loading v-if="isLoading" />
    <div v-else class="context-menu" ref="menu">
      <ContextMenuList
        :sections="menuSections"
        @action="handleMenuAction"
      />

      <el-dialog
        v-model="showDeleteDialog"
        title="Confirm Delete"
        width="420px"
        append-to-body
        :before-close="cancelDelete"
      >
        <div class="confirm-text">
          Delete "{{ selectedNode.name || selectedNode.id }}"?
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="cancelDelete" :disabled="isLoading">Cancel</el-button>
            <el-button type="danger" @click="confirmDelete" :loading="isLoading" :disabled="isLoading">
              {{ isLoading ? "Deleting..." : "Delete" }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { deleteDevice } from "@/api/device";
import { deleteOrganisation } from "@/api/organisation";
import { deleteSubstation } from "@/api/substation";
import { deleteVoltageLevel } from "@/api/voltagelevel";
import { deleteBay } from "@/api/bay";
import Loading from "@/components/Loading.vue";
import ContextMenuList from "./context-menu/ContextMenuList.vue";
import { buildContextMenuSections } from "./context-menu/contextMenuItems";
import { mapGetters } from "vuex";

export default {
  name: "ContextMenu",
  inheritAttrs: false,
  components: {
    Loading,
    ContextMenuList,
  },
  emits: ["refresh-tree", "close"],
  props: {
    visible: Boolean,
    position: Object,
    selectedNode: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      showDeleteDialog: false,
      isLoading: false,
    };
  },
  computed: {
    ...mapGetters(["language"]),
    nodeMode() {
      return this.selectedNode?.mode || "";
    },
    menuSections() {
      return buildContextMenuSections({
        hasSelectedNode: !!this.selectedNode?.id,
        language: this.language,
      });
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.$nextTick(() => this.scheduleAdjustMenuPosition());
        document.addEventListener("click", this.handleClickOutside);
      } else {
        document.removeEventListener("click", this.handleClickOutside);
      }
    },
    position() {
      if (this.visible) {
        this.$nextTick(() => this.scheduleAdjustMenuPosition());
      }
    },
  },
  methods: {
    scheduleAdjustMenuPosition() {
      if (this._menuFrame) cancelAnimationFrame(this._menuFrame);
      this._menuFrame = requestAnimationFrame(() => {
        this.adjustMenuPosition();
      });
    },
    handleClickOutside(e) {
      if (this.showDeleteDialog) return;
      if (this.$el && !this.$el.contains(e.target)) this.$emit("close");
    },
    handleMenuAction(action) {
      if (this.isLoading || action !== "delete") return;
      this.showDeleteDialog = true;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
      this.isLoading = false;
    },
    getDeleteConfig() {
      const mode = String(this.nodeMode || "");
      if (mode === "organisation") {
        return {
          deleteFn: deleteOrganisation,
          successMessage: "Organisation deleted",
          errorMessage: "Failed to delete organisation",
        };
      }
      if (mode === "substation") {
        return {
          deleteFn: deleteSubstation,
          successMessage: "Substation deleted",
          errorMessage: "Failed to delete substation",
        };
      }
      if (mode === "voltageLevel") {
        return {
          deleteFn: deleteVoltageLevel,
          successMessage: "Voltage Level deleted",
          errorMessage: "Failed to delete voltage level",
        };
      }
      if (mode === "bay") {
        return {
          deleteFn: deleteBay,
          successMessage: "Bay deleted",
          errorMessage: "Failed to delete bay",
        };
      }
      return {
        deleteFn: deleteDevice,
        successMessage: "Device deleted",
        errorMessage: "Failed to delete device",
      };
    },
    async confirmDelete() {
      if (this.isLoading) return;
      if (!this.selectedNode?.id) {
        this.$message?.error?.("Invalid node selected.");
        return;
      }

      const { deleteFn, successMessage, errorMessage } = this.getDeleteConfig();
      this.isLoading = true;
      try {
        await deleteFn(this.selectedNode.id);
        this.$message?.success?.(successMessage);
        this.$emit("refresh-tree");
        this.$emit("close");
      } catch (error) {
        this.$notifyApiError?.(error, errorMessage);
      } finally {
        this.isLoading = false;
        this.showDeleteDialog = false;
      }
    },
    adjustMenuPosition() {
      const wrapperEl = this.$el;
      const menuEl = this.$refs.menu;
      if (!wrapperEl || !menuEl || !this.position) return;

      let newTop = this.position.y;
      let newLeft = this.position.x;
      const menuRect = menuEl.getBoundingClientRect();
      const padding = 5;

      if (newTop + menuRect.height > window.innerHeight - padding) {
        newTop = Math.max(padding, this.position.y - menuRect.height);
      }
      if (newLeft + menuRect.width > window.innerWidth - padding) {
        newLeft = Math.max(padding, this.position.x - menuRect.width);
      }

      wrapperEl.style.top = `${Math.max(padding, newTop)}px`;
      wrapperEl.style.left = `${Math.max(padding, newLeft)}px`;
    },
  },
  beforeUnmount() {
    if (this._menuFrame) cancelAnimationFrame(this._menuFrame);
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.context-menu-wrapper {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  border: none !important;
  background: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.context-menu {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.08);
  min-width: 140px;
  padding: 6px 0;
  transition: opacity 0.3s ease;
  pointer-events: auto;
}

.confirm-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
  color: #333;
}
</style>
