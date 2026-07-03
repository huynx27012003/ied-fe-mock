<template>
  <li @contextmenu="handleRightClick($event, node)">
    <span
      :class="{
        selected: selectedNodes?.some((n) => n.id === node.id),
        'drag-over': isDragOver,
        'dragging-self': isDraggingSelf,
      }"
      class="folder no-select"
      :draggable="enableDragMove && canDragMoveNode"
      @click="handleRowClick($event)"
      @dblclick.stop="handleRowDblClick($event)"
      @dragstart="handleDragStart"
      @dragend="handleDragEnd"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div class="icon-wrapper">
        <template
            v-if="
              node.mode !== 'settingFunction' && node.mode !== 'protectionLevel'
            "
        >
          <div
            class="toggle-icon-container"
            :class="{ loading: isLoading }"
            @click.stop="handleToggleClick($event)"
          >
            <template
            v-if="
              hasChildrenForToggle &&
              !(
                node.mode === 'protectionFunction' &&
                !node.children.some((c) => c.mode === 'protectionLevel')
                ) &&
                !(node.mode === 'ied' && !node.isSclTree && !node.showParamTree)
              "
            >
              <i
                class="fa-solid fa-caret-right toggle-arrow"
                :class="{ rotated: node.expanded, hidden: isLoading }"
              ></i>
            </template>
            <template v-else>
              <span style="display: inline-block; width: 16px; height: 20px"></span>
            </template>
            
            <span class="spinner-inline" :class="{ active: isLoading }"></span>
          </div>
        </template>

        <template v-if="energyTreeModes.includes(node.mode)">
          <span class="energy-node-icon" :class="node.mode">
            <span
              v-if="energyLeafModes.includes(node.mode)"
              class="energy-status-dot"
              :class="node.status || 'online'"
            ></span>
            <i :class="energyIconByMode[node.mode]"></i>
          </span>
        </template>

        <template v-if="node.mode === 'voltageLevel'">
          <img
            :src="icons.voltage"
            alt="Voltage"
            style="width: 20px; height: 20px"
          />
        </template>
        <template v-if="node.mode === 'settingFunction'">
          <img
            :src="icons.settings"
            alt="Parameter"
            style="width: 16px; height: 16px; margin-left: 25px"
          />
        </template>

        <template v-if="node.mode === 'protectionLevel'">
          <img
            :src="icons.level"
            alt="Parameter"
            style="width: 16px; height: 16px; margin-left: 25px"
          />
        </template>

        <template v-else-if="node.mode === 'systemSetting' || node.mode === 'lineParameters'">
          <img
            :src="icons.systemSetting"
            alt="System Setting"
            style="width: 16px; height: 17px"
          />
        </template>
        <template v-else-if="node.mode === 'protectionFunction'">
          <img
            :src="icons.protection"
            alt="Protection"
            style="width: 16px; height: 16px"
          />
        </template>
        <template v-else-if="node.mode === 'protectionGroup'">
          <img
            :src="icons.group"
            alt="Group"
            style="width: 16px; height: 16px"
          />
        </template>
        <template v-else-if="node.isSclTree && sclModes.includes(node.mode) && node.mode !== 'service'">
          <span
            v-if="sclBadge"
            class="scl-mode-badge"
            :class="'badge-' + sclBadge.toLowerCase()"
          >{{ sclBadge }}</span>
        </template>

        <template v-else-if="parameterModes.includes(node.mode)">
          <img
            :src="icons.ied"
            alt="Parameter"
            style="width: 16px; height: 16px"
          />
        </template>
        <template v-else-if="node.mode === 'bay'">
          <img
            :src="icons.feeder"
            alt="Feeder"
            style="width: 16px; height: 16px"
          />
        </template>
        <template v-else-if="node.mode === 'ied'">
          <img
            :src="icons.ied"
            alt="IED"
            style="width: 16px; height: 16px"
          />
        </template>
        <template v-else-if="node.mode === 'substation'">
          <img
            :src="icons.location"
            alt="substation"
            style="width: 20px; height: 20px"
          />
        </template>
        <template v-else-if="node.mode === 'organisation'">
          <img
            :src="icons.owner"
            alt="organisation"
            style="width: 25px; height: 25px"
          />
        </template>
        <template v-else-if="assetType.includes(node.asset)">
          <icon size="16px" folderType="asset" badgeColor="146EBE" />
        </template>
        <template v-else-if="node.type === 'job'">
          <icon size="16px" folderType="job" badgeColor="FF0000" />
        </template>
        <template v-else-if="node.type === 'test'">
          <icon size="16px" folderType="test" badgeColor="008001" />
        </template>

        <div class="accent-line" v-if="selectedNodes?.some((n) => n.id === node.id)"></div>
        <template v-if="isRenaming">
          <input
            ref="renameInput"
            v-model="renameValue"
            class="rename-inline-input"
            type="text"
            @keydown.stop="handleRenameKeydown"
            @blur="handleRenameBlur"
          />
        </template>
        <span
          v-else
          class="node-name"
          :class="{
            'name-has-diff': isDiffNode,
            'name-missing': isMissingNode,
          }"
        >{{ node.name || node.serial_no }}</span>
        <slot name="node-append" :node="node"></slot>
      </div>
    </span>

    <ul v-if="node.expanded && node.mode !== 'settingFunction'">
      <TreeNode
        v-for="child in visibleChildren"
        :key="child.id"
        :node="child"
        :selectedNodes="selectedNodes"
        :selectedParameterId="selectedParameterId"
        :hide-operation-off="hideOperationOff"
        :show-leaf-dblclick-popup="showLeafDblclickPopup"
        :enable-drag-move="enableDragMove"
        :renaming-node-id="renamingNodeId"
        :disable-context-menu="disableContextMenu"
        @fetch-children="(n) => $emit('fetch-children', n)"
        @show-properties="(n) => $emit('show-properties', n)"
        @update-selection="updateSelection"
        @clear-selection="clearSelection"
        @open-context-menu="
          (event, childNode) => $emit('open-context-menu', event, childNode)
        "
        @toggle-node="(node) => $emit('toggle-node', node)"
        @node-dblclick="$emit('node-dblclick', $event)"
        @node-leaf-dblclick="$emit('node-leaf-dblclick', $event)"
        @node-row-dblclick="$emit('node-row-dblclick', $event)"
        @request-tree-refresh="$emit('request-tree-refresh')"
        @rename-node="$emit('rename-node', $event)"
        @cancel-rename="$emit('cancel-rename')"
        @node-right-click="$emit('node-right-click', $event)"
      >
        <template #node-append="slotProps">
          <slot name="node-append" v-bind="slotProps"></slot>
        </template>
      </TreeNode>
    </ul>
  </li>
</template>

<script>
import icon from "@/views/common/Icon.vue";
import { moveAsset, renameAsset } from "@/api/asset";
import collapseIcon from "@/assets/images/colapse.png";
import expandIcon from "@/assets/images/expand.png";
import voltageIcon from "@/assets/images/Voltage_Level.png";
import settingsIcon from "@/assets/images/settings.png";
import levelIcon from "@/assets/images/level.png";
import systemSettingIcon from "@/assets/images/systemSetting.png";
import protectionIcon from "@/assets/images/protection.png";
import groupIcon from "@/assets/images/group.png";
import feederIcon from "@/assets/images/feeder.png";
import iedIcon from "@/assets/images/IED.png";
import locationIcon from "@/assets/images/location.png";
import ownerIcon from "@/assets/images/owner.png";
import dataSetsIcon from "@/assets/images/DataSets.png";
import ldIcon from "@/assets/images/LD.png";
import lnIcon from "@/assets/images/LN.png";
import rIcon from "@/assets/images/R.png";
import daIcon from "@/assets/images/DA.png";
import doIcon from "@/assets/images/DO.png";
import sgIcon from "@/assets/images/SG.png";
import gIcon from "@/assets/images/G.png";

const SCL_BADGE_BY_MODE = {
  dataset: "DS",
  logicalDevice: "LD",
  logicalNode: "LN",
  settingGroup: "SG",
  goose: "G",
  urcb: "R",
  brcb: "R",
  reportControl: "R",
  dataObject: "DO",
  dataAttribute: "DA",
};

const ALL_ICONS = [
  collapseIcon,
  expandIcon,
  voltageIcon,
  settingsIcon,
  levelIcon,
  systemSettingIcon,
  protectionIcon,
  groupIcon,
  feederIcon,
  iedIcon,
  locationIcon,
  ownerIcon,
];
let iconsPreloaded = false;
let draggedNodePayload = null;
let dragIndicatorEl = null;

function ensureDragIndicator() {
  if (typeof document === "undefined") return null;
  if (dragIndicatorEl) return dragIndicatorEl;

  const el = document.createElement("div");
  el.className = "tree-drag-invalid-indicator";
  el.innerHTML = '<i class="fa-solid fa-ban"></i>';
  el.style.position = "fixed";
  el.style.left = "0";
  el.style.top = "0";
  el.style.width = "22px";
  el.style.height = "22px";
  el.style.display = "none";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.borderRadius = "50%";
  el.style.background = "rgba(255,255,255,0.95)";
  el.style.color = "#111";
  el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.25)";
  el.style.pointerEvents = "none";
  el.style.zIndex = "99999";
  document.body.appendChild(el);
  dragIndicatorEl = el;
  return dragIndicatorEl;
}

function showInvalidDragIndicator(clientX, clientY) {
  const el = ensureDragIndicator();
  if (!el) return;
  el.style.display = "flex";
  el.style.transform = `translate(${clientX + 12}px, ${clientY + 12}px)`;
}

function hideInvalidDragIndicator() {
  if (!dragIndicatorEl) return;
  dragIndicatorEl.style.display = "none";
}

function removeInvalidDragIndicator() {
  if (!dragIndicatorEl) return;
  dragIndicatorEl.remove();
  dragIndicatorEl = null;
}

function preloadIcons() {
  if (iconsPreloaded) return;
  ALL_ICONS.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
  iconsPreloaded = true;
}
preloadIcons();
export default {
  props: {
    node: { type: Object, required: true },
    selectedNodes: { type: Array, default: () => [] },
    selectedParameterId: { type: [String, Number], default: "" },
    hideOperationOff: { type: Boolean, default: false },
    showLeafDblclickPopup: { type: Boolean, default: false },
    enableDragMove: { type: Boolean, default: false },
    renamingNodeId: { type: [String, Number], default: null },
    disableContextMenu: { type: Boolean, default: false },
  },
  name: "TreeNode",
  emits: [
    "fetch-children",
    "show-properties",
    "update-selection",
    "clear-selection",
    "open-context-menu",
    "toggle-node",
    "node-dblclick",
    "node-leaf-dblclick",
    "node-row-dblclick",
    "request-tree-refresh",
    "rename-node",
    "cancel-rename",
    "node-right-click",
  ],
  components: {
    icon,
  },
  data() {
    return {
      loadingTimer: null,
      isLoading: false,
      isDragOver: false,
      isDraggingSelf: false,
      dragOverDepth: 0,
      renameValue: "",
      dataType: ["organisation"],
      dataOwnerType: ["substation", "bay"],
      assetType: [
        "Transformer",
        "Circuit breaker",
        "Current transformer",
        "Disconnector",
        "Surge arrester",
        "Power cable",
        "Voltage transformer",
      ],
      sclModes: [
        "root",
        "service",
        "logicalDevice",
        "logicalNode",
        "goose",
        "dataset",
        "settingGroup",
        "urcb",
        "brcb",
        "reportControl",
        "dataObject",
        "dataAttribute",
        "folder",
      ],
      parameterModes: [
        "parameterRoot",
        "parameter",
        "parameterGroup",
      ],
      energyTreeModes: [
        "site",
        "smartLogger",
        "logger",
        "inverterGroup",
        "inverter",
        "meterGroup",
        "meter",
      ],
      energyLeafModes: ["logger", "inverter", "meter"],
      energyIconByMode: {
        site: "fa-solid fa-location-dot",
        smartLogger: "fa-solid fa-microchip",
        logger: "fa-solid fa-server",
        inverterGroup: "fa-solid fa-solar-panel",
        inverter: "fa-solid fa-solar-panel",
        meterGroup: "fa-solid fa-gauge-high",
        meter: "fa-solid fa-gauge-high",
      },
      icons: {
        collapse: collapseIcon,
        expand: expandIcon,
        voltage: voltageIcon,
        settings: settingsIcon,
        level: levelIcon,
        systemSetting: systemSettingIcon,
        protection: protectionIcon,
        group: groupIcon,
        feeder: feederIcon,
        ied: iedIcon,
        location: locationIcon,
        owner: ownerIcon,
        dataSets: dataSetsIcon,
        ld: ldIcon,
        ln: lnIcon,
        r: rIcon,
        da: daIcon,
        do: doIcon,
        sg: sgIcon,
        g: gIcon,
      },
    };
  },
  created() {
    // no-op (preload already executed at module load)
  },
  computed: {
    sclBadge() {
      if (!this.node?.isSclTree) return "";
      return SCL_BADGE_BY_MODE[this.node?.mode] || "";
    },
    baseChildren() {
      if (!this.node || !Array.isArray(this.node.children)) return [];
      const isSclTree = !!this.node.isSclTree;
      const sclHiddenModes = new Set(["dataObject", "dataAttribute"]);
      // Parameter trees can contain raw pc* nodes that should not be visible in the navigation tree.
      // They are meant to be rendered in the table pane instead of the left tree.
      const hiddenModes = new Set(["pcDataObject"]);
      return this.node.children.filter((child) => {
        if (hiddenModes.has(child?.mode)) return false;
        if (isSclTree && sclHiddenModes.has(child?.mode)) return false;
        const name = String(child.name ?? "")
          .toLowerCase()
          .trim();
        return name !== "operation";
      });
    },
    visibleChildren() {
      let candidates = this.baseChildren;

      if (this.node.isSclTree || this.sclModes.includes(this.node.mode)) {
        // keep all nodes in SCL tree
      }

      if (this.node?.mode === "ied" && !this.node.isSclTree) {
        if (!this.node.showParamTree) {
          return [];
        }
        const pgChildren = candidates.filter((c) => c.mode === "protectionGroup");
        if (pgChildren.length) {
          const showAll = !!this.node.showAllGroups;
          const count = showAll
            ? pgChildren.length
            : Math.max(1, Math.min(this.node.groupVisibleCount || 1, pgChildren.length));
          const allowedIds = new Set(
            pgChildren.slice(0, Math.min(count, pgChildren.length)).map((c) => c.id)
          );
          candidates = candidates.filter((c) =>
            c.mode !== "protectionGroup" || allowedIds.has(c.id)
          );
        }
      }

      if (!this.hideOperationOff) return candidates;
      return candidates.filter((child) => this.hasVisibleSubtree(child));
    },
    hasChildrenForToggle() {
      return this.visibleChildren.length > 0;
    },
    parentName() {
      return this.node?.parentNode?.name || "";
    },
    isMissingNode() {
      return String(this.node?.compareStatus ?? "").toUpperCase() === "MISSING";
    },
    isDiffNode() {
      return String(this.node?.compareStatus ?? "").toUpperCase() === "DIFF";
    },
    canDragMoveNode() {
      return !!this.getExpectedTargetMode(this.node?.mode);
    },
    isRenaming() {
      return this.renamingNodeId != null && String(this.renamingNodeId) === String(this.node?.id);
    },
  },
  watch: {
    isRenaming(val) {
      if (val) {
        this.renameValue = this.node?.name || "";
        this.$nextTick(() => {
          this.$refs.renameInput?.focus?.();
          this.$refs.renameInput?.select?.();
        });
      }
    },
    "node.children"(val) {
      if (this.isLoading && Array.isArray(val)) {
        if (this.loadingTimer) {
          clearTimeout(this.loadingTimer);
          this.loadingTimer = null;
        }
        this.isLoading = false;
      }
    },
  },
  methods: {
    handleRenameKeydown(event) {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        this.confirmRename();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        this.$emit("cancel-rename");
      }
    },
    handleRenameBlur() {
      this.$nextTick(() => {
        if (!this.isRenaming) return;
        const active = document.activeElement;
        if (active !== this.$refs.renameInput) {
          this.$emit("cancel-rename");
        }
      });
    },
    async confirmRename() {
      const newName = this.renameValue?.trim();
      if (!newName) {
        this.$message?.warning?.(this.$tUi('nameCannotBeEmpty'));
        return;
      }
      if (newName === this.node?.name) {
        this.$emit("cancel-rename");
        return;
      }
      const mode = this.node?.mode;
      const id = this.node?.id;
      if (!mode || !id) {
        this.$message?.error?.(this.$tUi('invalidNode'));
        this.$emit("cancel-rename");
        return;
      }
      try {
        const response = await renameAsset(mode, id, newName);
        const updatedName = response?.data?.name || response?.name || newName;
        this.$emit("rename-node", { id, mode, newName: updatedName });
        this.$message?.success?.(this.$tUi('renamedSuccess'));
        this.$emit("request-tree-refresh");
      } catch (error) {
        this.$notifyApiError?.(error, "Failed to rename");
      }
      this.$emit("cancel-rename");
    },
    normalize(value) {
      return String(value ?? "")
        .toLowerCase()
        .trim();
    },
    isDirectOperationOff(node) {
      if (!node) return false;
      const children = Array.isArray(node.children)
        ? node.children
        : Array.isArray(node.childrenFromData)
          ? node.childrenFromData
          : [];
      return children.some(
        (child) =>
          this.normalize(child?.name) === "operation" &&
          this.normalize(child?.value) === "off"
      );
    },
    getExpectedTargetMode(dragMode) {
      const mode = String(dragMode || "");
      const map = {
        ied: "bay",
        bay: "voltageLevel",
        voltageLevel: "substation",
        substation: "organisation",
      };
      return map[mode] || "";
    },
    parseDraggedPayload(event) {
      const rawPayload = event?.dataTransfer?.getData("application/x-ied-tree-node") || "";
      if (rawPayload) {
        try {
          return JSON.parse(rawPayload);
        } catch (e) {
          // fall back below
        }
      }
      return draggedNodePayload;
    },
    isValidDropTarget(payload) {
      const id = payload?.id;
      const mode = payload?.mode;
      const ownerId = this.node?.id;
      const targetMode = this.node?.mode;
      if (!id || !mode || !ownerId || !targetMode) return false;
      if (String(id) === String(ownerId)) return false;
      const expectedMode = this.getExpectedTargetMode(mode);
      if (!expectedMode) return false;
      return String(targetMode) === String(expectedMode);
    },
    getChildList(node) {
      if (!node) return [];
      if (Array.isArray(node.children)) return node.children;
      if (Array.isArray(node.childrenFromData)) return node.childrenFromData;
      return [];
    },
    hasVisibleSubtree(node) {
      if (!this.hideOperationOff) return true;
      if (!node) return false;

      if (this.isDirectOperationOff(node)) return false;

      const kids = this.getChildList(node).filter((child) => {
        const name = this.normalize(child?.name);
        return name !== "operation";
      });

      if (!kids.length) return true;

      return kids.some((child) => this.hasVisibleSubtree(child));
    },
    toggle(event) {
  if (event && event.button !== 0) return;

  const isToggleIcon =
    event?.target?.getAttribute &&
    event.target.getAttribute("alt") === "toggle";

  const expanding = !this.node.expanded;
  
  const doToggle = () => {
    // Hủy timer cũ nếu có
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
    
    if (expanding) {
      // Chỉ emit toggle, không cần loading state
      this.$emit("toggle-node", this.node);
      
      // Nếu chưa có children thì fetch
      if (!this.node.children || this.node.children.length === 0) {
        this.$emit("fetch-children", this.node);
      }
    } else {
      // Đóng node ngay lập tức
      this.isLoading = false;
      this.$emit("toggle-node", this.node);
    }
  };

  if (isToggleIcon) {
    doToggle();
    return;
  }

  if (event && event.ctrlKey) {
    this.updateSelection(this.node);
  } else {
    this.clearSelection();
    this.$emit("show-properties", this.node);

    if (
      this.node.mode === "settingFunction" ||
      this.node.mode === "protectionLevel" ||
      (this.node.mode === "protectionFunction" &&
        (!this.node.children ||
          !this.node.children.some((c) => c.mode === "protectionLevel")))
    ) {
      this.$emit("select-parameter", this.node);
      return;
    }
  }

  doToggle();
},

    canToggleNode() {
      if (!this.hasChildrenForToggle) return false;

      if (
        this.node?.mode === "protectionFunction" &&
        Array.isArray(this.node?.children) &&
        !this.node.children.some((c) => c.mode === "protectionLevel")
      ) {
        return false;
      }

      if (this.node?.mode === "ied" && !this.node.isSclTree && !this.node.showParamTree) {
        return false;
      }

      return true;
    },
    isToggleArrowVisible() {
      if (this.node?.mode === "settingFunction" || this.node?.mode === "protectionLevel") {
        return false;
      }

      if (!this.hasChildrenForToggle) return false;

      if (
        this.node?.mode === "protectionFunction" &&
        Array.isArray(this.node?.children) &&
        !this.node.children.some((c) => c.mode === "protectionLevel")
      ) {
        return false;
      }

      if (this.node?.mode === "ied" && !this.node.isSclTree && !this.node.showParamTree) {
        return false;
      }

      return true;
    },

    handleToggleClick(event) {
      if (event && event.button !== 0) return;
      if (!this.canToggleNode()) return;

      const expanding = !this.node.expanded;

      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }

      this.$emit("toggle-node", this.node);

      if (expanding) {
        const children = this.getChildList(this.node);
        if (!children.length) {
          this.$emit("fetch-children", this.node);
        }
      } else {
        this.isLoading = false;
      }
    },

    handleRowClick(event) {
      if (event && event.button !== 0) return;

      if (event && event.ctrlKey) {
        this.updateSelection(this.node);
        return;
      }

      this.clearSelection();
      this.$emit("show-properties", this.node);

      if (
        this.node.mode === "settingFunction" ||
        this.node.mode === "protectionLevel" ||
        (this.node.mode === "protectionFunction" &&
          (!this.node.children ||
            !this.node.children.some((c) => c.mode === "protectionLevel")))
      ) {
        this.$emit("select-parameter", this.node);
      }
    },
    handleRowDblClick(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      this.$emit("node-row-dblclick", this.node);
      if (this.showLeafDblclickPopup && !this.isToggleArrowVisible()) {
        this.$emit("node-leaf-dblclick", this.node);
        return;
      }
      // behave exactly like clicking the toggle icon
      this.handleToggleClick({ button: 0 });
    },

    updateSelection(node) {
      this.$emit("update-selection", node);
    },
    clearSelection() {
      this.$emit("clear-selection");
    },

    handleRightClick(event, node) {
      event.preventDefault();
      event.stopPropagation();
      if (this.disableContextMenu) {
        this.$emit("node-right-click", node);
        return;
      }

      const fastOpenModes = new Set([
        "protectionFunction",
        "protectionLevel",
        "protectionGroup",
        "settingFunction",
        "systemSetting",
        "lineParameters",
      ]);

      if (fastOpenModes.has(node?.mode)) {
        this.$emit("node-dblclick", node);
        return;
      }

      this.$emit("open-context-menu", event, node);
    },

    handleDragStart(event) {
      if (!this.enableDragMove || !this.canDragMoveNode) return;
      this.isDraggingSelf = true;
      hideInvalidDragIndicator();
      draggedNodePayload = {
        id: this.node?.id,
        mode: this.node?.mode,
      };
      if (event?.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(
          "application/x-ied-tree-node",
          JSON.stringify(draggedNodePayload)
        );
        event.dataTransfer.setData("text/plain", String(this.node?.id ?? ""));
      }
    },
    handleDragEnd() {
      this.isDraggingSelf = false;
      this.isDragOver = false;
      this.dragOverDepth = 0;
      draggedNodePayload = null;
      hideInvalidDragIndicator();
      removeInvalidDragIndicator();
    },
    handleDragEnter(event) {
      if (!this.enableDragMove) return;
      const payload = this.parseDraggedPayload(event);
      if (!this.isValidDropTarget(payload)) {
        this.isDragOver = false;
        showInvalidDragIndicator(event?.clientX || 0, event?.clientY || 0);
        if (event?.dataTransfer) event.dataTransfer.dropEffect = "none";
        return;
      }
      this.dragOverDepth += 1;
      this.isDragOver = true;
      hideInvalidDragIndicator();
      if (event?.dataTransfer) event.dataTransfer.dropEffect = "move";
    },
    handleDragOver(event) {
      if (!this.enableDragMove) return;
      const payload = this.parseDraggedPayload(event);
      if (!this.isValidDropTarget(payload)) {
        this.isDragOver = false;
        showInvalidDragIndicator(event?.clientX || 0, event?.clientY || 0);
        if (event?.dataTransfer) event.dataTransfer.dropEffect = "none";
        return;
      }
      event.preventDefault();
      this.isDragOver = true;
      hideInvalidDragIndicator();
      if (event?.dataTransfer) event.dataTransfer.dropEffect = "move";
    },
    handleDragLeave() {
      this.dragOverDepth = Math.max(0, this.dragOverDepth - 1);
      if (this.dragOverDepth === 0) {
        this.isDragOver = false;
      }
      hideInvalidDragIndicator();
    },
    async handleDrop(event) {
      if (!this.enableDragMove) return;
      event.preventDefault();
      this.isDragOver = false;
      this.dragOverDepth = 0;
      hideInvalidDragIndicator();

      const payload = this.parseDraggedPayload(event);
      if (!this.isValidDropTarget(payload)) return;

      const id = payload?.id;
      const mode = payload?.mode;
      const ownerId = this.node?.id;

      if (!id || !mode || !ownerId) return;
      if (String(id) === String(ownerId)) return;

      try {
        await moveAsset(mode, id, ownerId);
        this.$message?.success?.(this.$tUi('nodeMovedSuccess'));
        this.$emit("request-tree-refresh");
      } catch (error) {
        this.$notifyApiError?.(error, "Failed to move node");
      }
    },
  },
  beforeUnmount() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
      this.loadingTimer = null;
    }
    hideInvalidDragIndicator();
  },
};
</script>

<style scoped>
.folder {
  display: block;
  padding: 5px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  color: #31435c;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  position: relative;
  border-radius: 6px;
  margin: 2px 6px 2px 0;
  border: 1px solid transparent;
  background: transparent;
}

.folder:hover {
  background: #f0f6ff;
  color: #1e3c72;
  border-color: #d9e8fb;
  box-shadow: 0 2px 7px rgba(41, 73, 116, 0.07);
}

.folder.drag-over {
  background: rgba(59, 130, 246, 0.16) !important;
  box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.4);
}

.folder.dragging-self {
  opacity: 0.55;
}

ul {
  list-style: none;
  padding-left: 14px;
  border-left: 1px solid #e1ebf7;
}

.selected {
  background: linear-gradient(90deg, #dcecff 0%, #eef6ff 78%, #fff 100%) !important;
  color: #123c75 !important;
  font-weight: 700;
  border-color: #bfd8f6;
  box-shadow: inset 3px 0 0 #1f6fc7;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.energy-node-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 15px;
  flex: 0 0 18px;
  color: #54677f;
}

.energy-status-dot {
  width: 9px;
  height: 9px;
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: #62d827;
  box-shadow: 0 0 3px rgba(98, 216, 39, 0.8);
}

.energy-status-dot.offline {
  background: #9ca3af;
  box-shadow: none;
}

.toggle-icon-container {
  width: 16px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.toggle-arrow {
  font-size: 12px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #5f86b6;
}

.toggle-arrow.hidden {
  visibility: hidden;
}

.toggle-arrow.rotated {
  transform: rotate(90deg);
  color: #1f6fc7;
}

.accent-line {
  position: absolute;
  left: 0;
  top: 12%;
  height: 76%;
  width: 3px;
  background: #1f6fc7;
  border-radius: 2px;
  box-shadow: none;
}

.node-name {
  white-space: nowrap;
  letter-spacing: 0;
  font-weight: 600;
}

.node-name.name-has-diff {
  color: #c62828;
}

.node-name.name-missing {
  color: #1565c0;
}

img {
  filter: drop-shadow(0 1px 2px rgba(30, 60, 114, 0.12));
}

.folder:hover img {
  transform: scale(1.06);
  transition: transform 0.2s ease;
}

.scl-mode-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 16px;
  min-width: 16px;
  padding: 0 3px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  color: #fff;
  background: #146ebe;
  flex: none;
  white-space: nowrap;
}

.scl-mode-badge.badge-da,
.scl-mode-badge.badge-do {
  background: #146ebe;
}

.scl-mode-badge.badge-ln,
.scl-mode-badge.badge-ld,
.scl-mode-badge.badge-ds,
.scl-mode-badge.badge-sg,
.scl-mode-badge.badge-g,
.scl-mode-badge.badge-r {
  background: #5a6b7d;
}

.dataset-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  object-fit: contain;
  padding: 0;
  margin: 0;
  transform: scale(1.5) translateY(2px);
  transform-origin: center center;
  vertical-align: middle;
  filter: none !important;
  box-shadow: none !important;
}

.ld-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  object-fit: contain;
  padding: 0;
  margin: 0;
  transform: scale(1.5) translateY(2px);
  transform-origin: center center;
  vertical-align: middle;
  filter: none !important;
  box-shadow: none !important;
}

.ln-icon,
.sg-icon,
.g-icon,
.r-icon,
.da-icon,
.do-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  object-fit: contain;
  padding: 0;
  margin: 0;
  transform: scale(1.5) translateY(2px);
  transform-origin: center center;
  vertical-align: middle;
  filter: none !important;
  box-shadow: none !important;
}

.no-select {
  user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}

.spinner-inline {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #cfd8dc;
  border-top-color: #409eff;
  border-radius: 50%;
  position: absolute;
  opacity: 0;
  visibility: hidden;
  transform: translateZ(0);
  will-change: transform;
  pointer-events: none;
}

.spinner-inline.active {
  opacity: 1;
  visibility: visible;
  animation: spinner-rotate 0.6s linear infinite;
}

@keyframes spinner-rotate {
  to {
    transform: translateZ(0) rotate(360deg);
  }
}

.rename-inline-input {
  border: 1px solid #409eff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
  outline: none;
  width: 160px;
  max-width: 200px;
  background: #fff;
  color: #333;
  font-family: inherit;
}
</style>
