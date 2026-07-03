/* eslint-disable */
import TreeNode from "../common/TreeNode.vue";
import Tabs from "../common/Tabs.vue";
import ContextMenu from "../common/ContextMenu.vue";
import ActivityBar from "../common/ActivityBar.vue";
import SCLManage from "../common/SCLManage.vue";
import DateTimeSetting from "@/views/SettingView/DateTimeSetting.vue";
import PlantSetting from "@/views/SettingView/PlantSetting.vue";
import WirelessNetworkSetting from "@/views/SettingView/WirelessNetworkSetting.vue";
import WiredNetworkSetting from "@/views/SettingView/WiredNetworkSetting.vue";
import Rs485Setting from "@/views/SettingView/Rs485Setting.vue";
import ModbusTcpSetting from "@/views/SettingView/ModbusTcpSetting.vue";
import ManagementSystemSetting from "@/views/SettingView/ManagementSystemSetting.vue";
import PlaceholderSetting from "@/views/SettingView/PlaceholderSetting.vue";
import {
  getEntityTreeRaw,
  getPropertiesById,
  getAncestorsById,
  getAncestorByMode,
} from "@/api/treenode";
import { getIedInfoById } from "@/api/device";
import { mapGetters } from "vuex";
import { useSidebarResize } from "@/helpers/treeNavigation/useSidebarResize";
import { useTabs } from "@/helpers/treeNavigation/useTabs";
import { useContextMenu } from "@/helpers/treeNavigation/useContextMenu";
import { useSclImportStore } from "@/helpers/treeNavigation/useSclImportStore";

const EMPTY_PROPS = () => ({
  Owner1: "",
  Owner2: "",
  Owner3: "",
  Location: "",
  VoltageLevel: "",
  Feeder: "",
});

// Translation dictionary
const translations = {
  "en-vi": {
    home: "Home",
    location: "Location",
    owner: "Owner",
    objectProperties: "Object Properties",
    ownerAndPosition: "Owner & Position",
    owner1: "Owner 1",
    owner2: "Owner 2",
    owner3: "Owner 3",
    voltageLevel: "Voltage Level",
    feeder: "Feeder",
    deviceInformation: "Device Information",
    name: "Name",
    description: "Description",
    vendor: "Vendor",
    model: "Model",
    serialNumber: "Serial Number",
    hardwareVersion: "Hardware Version",
    softwareVersion: "Software Version",
    orderCode: "Order Code",
    roles: "Roles",
    configurationVersion: "Configuration Version",
    lastModified: "Last Modified",
    author: "Author",
    lastSavedBy: "Last Saved By",
    importIed: "Import IED",
  },
  "vi-vi": {
    home: "Trang chủ",
    location: "Vị trí",
    owner: "Chủ sở hữu",
    objectProperties: "Thuộc tính đối tượng",
    ownerAndPosition: "Chủ sở hữu & Vị trí",
    owner1: "Chủ sở hữu 1",
    owner2: "Chủ sở hữu 2",
    owner3: "Chủ sở hữu 3",
    voltageLevel: "Mức điện áp",
    feeder: "Đường dây cấp điện",
    deviceInformation: "Thông tin thiết bị",
    name: "Tên",
    description: "Mô tả",
    vendor: "Nhà cung cấp",
    model: "Mẫu",
    serialNumber: "Số sê-ri",
    hardwareVersion: "Phiên bản phần cứng",
    softwareVersion: "Phiên bản phần mềm",
    orderCode: "Mã đặt hàng",
    roles: "Vai trò",
    configurationVersion: "Phiên bản cấu hình",
    lastModified: "Sửa đổi lần cuối",
    author: "Tác giả",
    lastSavedBy: "Lưu lần cuối bởi",
    importIed: "Nhập IED",
  },
};

const GOOSE_CONTROL_BLOCK_FIELDS = [
  { key: "controlBlockReference", label: "Control Block reference" },
  { key: "destinationMacAddress", label: "Destinstion MAC Address" },
  { key: "applicationId", label: "Application ID" },
  { key: "gooseId", label: "GOOSE ID" },
  { key: "dataSetReference", label: "DataSet reference" },
  { key: "vlanId", label: "VLAN ID" },
  { key: "vlanPriority", label: "VLAN Priority" },
  { key: "minTime", label: "Min Time" },
  { key: "maxTime", label: "Max Time" },
  { key: "configurationRevision", label: "Configuration revision" },
];

const REPORT_CONTROL_BLOCK_FIELDS = [
  { key: "controlBlockReference", label: "Control Block reference" },
  { key: "dataSetReference", label: "DataSet reference" },
  { key: "reportId", label: "Report ID" },
  { key: "triggerOptions", label: "Trigger options" },
  { key: "bufferTimeMs", label: "Buffer time (ms)" },
  { key: "configurationRevision", label: "Configuration revision" },
  { key: "integrityPeriodMs", label: "Integrity period (ms)" },
  { key: "owner", label: "Owner" },
];

const ENERGY_MONITORING_MODES = new Set([
  "site",
  "smartLogger",
  "logger",
  "inverterGroup",
  "inverter",
  "meterGroup",
  "meter",
]);

const SETTING_GROUP_FIELDS = [
  { key: "controlBlock", label: "Control Block" },
  { key: "numberOfSettingGroups", label: "Number of Setting Groups" },
  { key: "activeSettingGroup", label: "Active Setting Group" },
  { key: "lastChanged", label: "Last changed" },
  { key: "reserveTime", label: "Reserve time (seconds)" },
  { key: "affectedLogicalDevices", label: "Affected Logical Devices" },
];

const resolveControlBlockValue = (block, key) => {
  if (!block || typeof block !== "object") return "";
  if (Object.prototype.hasOwnProperty.call(block, key)) return block[key];
  const target = String(key).toLowerCase();
  const matchKey = Object.keys(block).find(
    (k) => String(k).toLowerCase() === target
  );
  return matchKey ? block[matchKey] : "";
};

const formatControlBlockValue = (value) => {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
};

export default {
  name: "TreeNavigation",
  components: {
    TreeNode,
    Tabs,
    ContextMenu,
    ActivityBar,
    SCLManage,
    DateTimeSetting,
    PlantSetting,
    WirelessNetworkSetting,
    WiredNetworkSetting,
    Rs485Setting,
    ModbusTcpSetting,
    ManagementSystemSetting,
    PlaceholderSetting,
  },
  computed: {
    ...mapGetters(["language"]),
    selectedId() {
      return (
        this.selectedOwnerNodes[0]?.id ??
        this.selectedLocationNodes[0]?.id ??
        this.selectedNodes[0]?.id ??
        null
      );
    },
    renderOwnerList() {
      if (!this.hideOperationOff) return this.ownerServerList;
      return this.ownerServerList.filter((n) => !this.isOperationOffDirect(n));
    },
    sidebarTotalWidthPx() {
      if (this.sidebarCollapsed) return 0;
      if (this.activeView === 'overview') return 0;
      if (this.activeView !== 'explorer') return this.ownerWidthPx;
      let width = this.ownerWidthPx;
      if (this.showSCL) width += this.sclWidthPx + 4; // +4 for resizer handle
      if (this.showParam) width += this.paramWidthPx + 4;
      return width;
    },
    sclTargetName() {
      return this.sclTargetNode?.name || "IED";
    },
    activeSettingComponent() {
      const componentByItem = {
        "date-time": "DateTimeSetting",
        plant: "PlantSetting",
        "wireless-network": "WirelessNetworkSetting",
        "wired-network": "WiredNetworkSetting",
        rs485: "Rs485Setting",
        "modbus-tcp": "ModbusTcpSetting",
        "management-system": "ManagementSystemSetting",
      };
      return componentByItem[this.activeSettingMenuItem] || "PlaceholderSetting";
    },
  },
  provide() {
    return {
      sclImportStore: this.sclImportStore,
    };
  },
  data() {
    return {
      activeView: 'explorer',
      activeSettingMenuItem: "date-time",
      settingMenuGroups: [
        {
          id: "user-param",
          label: "User Param.",
          expanded: true,
          children: [
            { id: "date-time", label: "Date&Time" },
            { id: "plant", label: "Plant" },
            { id: "revenue", label: "Revenue" },
            { id: "save-period", label: "Save Period" },
          ],
        },
        {
          id: "comm-param",
          label: "Comm. Param.",
          expanded: true,
          children: [
            { id: "wireless-network", label: "Wireless Network" },
            { id: "wired-network", label: "Wired Network" },
            { id: "rs485", label: "RS485" },
            { id: "management-system", label: "Management System" },
            { id: "modbus-tcp", label: "Modbus TCP" },
            { id: "iec103", label: "IEC103" },
            { id: "iec104", label: "IEC104" },
            { id: "ftp", label: "FTP" },
            { id: "email", label: "Email" },
            { id: "goose", label: "GOOSE" },
            { id: "sppc", label: "SPPC" },
          ],
        },
        {
          id: "power-adjustment",
          label: "Power Adjustment",
          expanded: false,
          children: [
            { id: "active-power-control", label: "Active Power Control" },
            { id: "reactive-power-control", label: "Reactive Power Control" },
          ],
        },
        {
          id: "battery-control",
          label: "Battery Control",
          expanded: false,
          children: [],
        },
        {
          id: "remote-shutdown",
          label: "Remote Shutdown",
          expanded: false,
          children: [],
        },
        {
          id: "di",
          label: "DI",
          expanded: false,
          children: [],
        },
        {
          id: "alarm-output",
          label: "Alarm Output",
          expanded: false,
          children: [],
        },
        {
          id: "smart-tracking",
          label: "Smart Tracking Algorithm",
          expanded: false,
          children: [],
        },
        {
          id: "feature-parameters",
          label: "Feature Parameters",
          expanded: false,
          children: [],
        },
        {
          id: "other-parameters",
          label: "Other Parameters",
          expanded: false,
          children: [],
        },
      ],
      menuVisible: false,
      menuPosition: { x: 0, y: 0 },
      selectedNode: {},
      tree: [],
      currentNodeId: null,
      activeTab: {},
      tabs: [],
      rightClickNode: null,
      selectedOwnerNodes: [],
      selectedLocationNodes: [],
      selectedNodes: [],
      locationList: [],
      showOwner: true,
      clientSlide: false,
      pathMapServer: [],
      pathMapClient: [],
      showTabContentServer: [],
      hideTabContentServer: [],
      showTabContentClient: [],
      hideTabContentClient: [],
      currentTabServer: "",
      sidebarCollapsed: false,
      properties: {
        Owner1: "",
        Owner2: "",
        Owner3: "",
        Location: "",
        VoltageLevel: "",
        Feeder: "",
      },
      propertiesPaneTab: "object",
      controlBlockAttributeRows: GOOSE_CONTROL_BLOCK_FIELDS.map((field) => ({
        label: field.label,
        value: "",
      })),
      controlBlockTitle: "",
      controlBlockVisible: false,
      contextMenuPosition: { x: 0, y: 0 },
      Information: {
        name: "",
        description: "",
        vendor: "",
        model: "",
        serialNumber: "",
        hardwareVersion: "",
        softwareVersion: "",
        orderCode: "",
        roles: "",
      },
      jobProperties: {
        name: "",
        work_order: "",
        creation_date: "",
        execution_date: "",
        tested_by: "",
        approved_by: "",
        ambient_condition: "",
        standard: "",
      },
      propertiesClient: {
        region: "",
        name: "",
        plant: "",
        address: "",
        city: "",
        state_province: "",
        postal_code: "",
        country: "",
        phone_no: "",
        email: "",
      },
      assetPropertiesClient: {
        asset: "",
        asset_type: "",
        serial_no: "",
        manufacturer: "",
        manufacturer_type: "",
        manufacturing_year: "",
        apparatus_id: "",
        country: "",
      },
      expandedNodes: new Set(),
      jobPropertiesClient: {
        name: "",
        work_order: "",
        creation_date: "",
        execution_date: "",
        tested_by: "",
        approved_by: "",
        ambient_condition: "",
        standard: "",
      },
      logSign: false,
      logSignClient: false,
      propertiesSign: true,
      propertiesSignClient: true,
      clientSlide: false,
      pageLocationSync: {
        first: 1,
        second: 2,
        third: 3,
        dot: "...",
        end: 10,
      },
      displayPageLocationSync: {
        second: true,
        third: true,
        dot: true,
        end: true,
      },
      pageLocationSyncInstance: {
        first: "",
        second: "",
        third: "",
        dot: "",
        end: "",
      },
      currentLocationSync: {
        nextP: "",
        previousP: "",
        current: 1,
      },
      optionLocationSync: {
        mode: "",
      },
      sl: 10,
      count: "",
      selectedParameterId: null,
      ownerServerList: [],
      ownerTreeLoading: false,
      ownerTreeLoaded: false,
      // Cache thông tin IED theo iedId để tránh gọi lại API nhiều lần
      iedInfoCache: {},
      AssetType: [
        "Transformer",
        "Circuit breaker",
        "Current transformer",
        "Voltage transformer",
        "Disconnector",
        "Power cable",
        "Surge arrester",
      ],
      LocationType: ["location", "voltage", "feeder"],
      contextMenuVisible: false,
      renamingNodeId: null,
      assetPropertySign: true,
      hideOperationOff: false,
      showSCL: false,
      sclTreeData: [],
      sclLoading: false,
      sclTargetNode: null,
      // ActivityBar "SCL Import" shared state (tree in sidebar, table in tab).
      // Keep this object reference stable, so `provide/inject` stays reactive.
      sclImportStore: {
        sclTreeData: [],
        selectedNodes: [],
        isLoading: false,
        fileName: "",
        tableRootNode: null,
      },
      showParam: false,
      paramTreeData: [],
      paramLoading: false,
      resizing: false,
      sidebarWidthPercent: 20,
      internalOwnerWidthPercent: 100,
      ownerWidthPx: 300,
      sclWidthPx: 300,
      paramWidthPx: 300,
    };
  },

  methods: {
    ...useSidebarResize(),
    ...useTabs(),
    ...useContextMenu(),
    ...useSclImportStore(),
    handleControlBlockUpdate(node) {
      const mode = String(node?.mode || "").toLowerCase();
      const allowed = new Set(["goose", "urcb", "brcb", "settinggroup"]);
      let block =
        node?.controlBlock ??
        node?.controlblock ??
        node?.control_block ??
        null;
      if (block && typeof block === "string") {
        try {
          block = JSON.parse(block);
        } catch {
          block = null;
        }
      }
      if (block && block.controlBlock && typeof block.controlBlock === "object") {
        block = block.controlBlock;
      }
      if (!node || !allowed.has(mode)) {
        this.controlBlockAttributeRows = GOOSE_CONTROL_BLOCK_FIELDS.map((field) => ({
          label: field.label,
          value: "",
        }));
        this.controlBlockTitle = node?.name ? String(node.name) : "";
        this.controlBlockVisible = false;
        return;
      }
      const safeBlock = block && typeof block === "object" ? block : {};
      let fields = REPORT_CONTROL_BLOCK_FIELDS;
      if (mode === "goose") fields = GOOSE_CONTROL_BLOCK_FIELDS;
      if (mode === "settinggroup") fields = SETTING_GROUP_FIELDS;
      this.controlBlockAttributeRows = fields.map((field) => ({
        label: field.label,
        value: formatControlBlockValue(resolveControlBlockValue(safeBlock, field.key)),
      }));
      this.controlBlockTitle = node?.name ? String(node.name) : "";
      this.controlBlockVisible = true;
    },
    buildParentArrFromNode(node) {
      const arr = [];
      let current = node?.parentNode || null;
      while (current) {
        arr.unshift(current);
        current = current.parentNode || null;
      }
      return arr;
    },
    setActiveView(viewName) {
      if (this.sidebarCollapsed) {
        this.openSidebar();
      }
      this.activeView = viewName;
    },
    toggleSettingGroup(group) {
      if (!group) return;
      group.expanded = !group.expanded;
    },
    selectSettingMenuItem(item) {
      if (!item?.id) return;
      this.activeSettingMenuItem = item.id;
    },
    // Translation method
    $t(key, params = {}) {
      const currentLang = this.language || "en-vi";
      let text =
        translations[currentLang]?.[key] || translations["en-vi"][key] || key;

      Object.keys(params).forEach((param) => {
        text = text.replace(`{${param}}`, params[param]);
      });

      return text;
    },
    normalizeValue(value) {
      return String(value ?? "")
        .toLowerCase()
        .trim();
    },

    isOperationOffDirect(node) {
      if (!node) return false;
      const children = Array.isArray(node.children)
        ? node.children
        : Array.isArray(node.childrenFromData)
          ? node.childrenFromData
          : [];
      return children.some(
        (c) =>
          this.normalizeValue(c?.name) === "operation" &&
          this.normalizeValue(c?.value) === "off"
      );
    },

    handleNodeDblClick(node) {
      if (!node) return;
      this.openEnergyMonitoringTab(node);
    },

    openEnergyMonitoringTab(node) {
      if (!node || !ENERGY_MONITORING_MODES.has(node.mode)) return;

      const tabId = `energy-monitoring-${node.id}`;
      let tab = this.tabs.find((t) => t.id === tabId);

      if (!tab) {
        tab = {
          id: tabId,
          name: `${node.name} - Monitoring`,
          mode: node.mode,
          component: "EnergyMonitoringTab",
          node,
          focusNode: node,
        };
        this.tabs.push(tab);
      } else {
        tab.name = `${node.name} - Monitoring`;
        tab.node = node;
        tab.focusNode = node;
      }

      this.activeTab = { ...tab };
    },

    handleUpdateFocus(payload) {
      if (!payload) return;
      this.closeContextMenu();
    },
    async resetAllServer() {
      this.pathMapServer = [];
      this.selectedNode = null;

      const collapseNodes = (nodes) => {
        if (!Array.isArray(nodes)) return;
        nodes.forEach((node) => {
          node.expanded = false;
          if (node.children && node.children.length > 0) {
            collapseNodes(node.children);
          }
        });
      };
      collapseNodes(this.ownerServerList);
    },

    async resetPathServer(index) {
      if (index === 0) {
        let currentNode = this.ownerServerList.find(
          (node) => node.id === this.pathMapServer[0]?.id
        );
        if (!currentNode) {
          return;
        }
        await this.clearSelection();
        await this.showPropertiesData(currentNode);

        const collapseChildren = (node) => {
          if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
              if (!("expanded" in child)) {
                child.expanded = false;
              } else {
                child.expanded = false;
              }
              collapseChildren(child);
            });
          }
        };
        collapseChildren(currentNode);

        if (!("expanded" in currentNode)) {
          currentNode.expanded = true;
        } else {
          currentNode.expanded = !currentNode.expanded;
        }
      } else {
        let currentNode = this.ownerServerList.find(
          (node) => node.id === this.pathMapServer[0]?.id
        );
        if (!currentNode) {
          return;
        }
        for (let i = 1; i <= index; i++) {
          if (!currentNode.children) return;
          currentNode = currentNode.children.find(
            (child) => child.id === this.pathMapServer[i]?.id
          );
          if (!currentNode) {
            return;
          }
        }
        await this.clearSelection();
        await this.showPropertiesData(currentNode);

        const collapseChildren = (node) => {
          if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
              if (!("expanded" in child)) {
                child.expanded = false;
              } else {
                child.expanded = false;
              }
              collapseChildren(child);
            });
          }
        };
        collapseChildren(currentNode);

        if (!("expanded" in currentNode)) {
          currentNode.expanded = true;
        } else {
          currentNode.expanded = !currentNode.expanded;
        }
      }
    },

    findNodeById(nodes, id) {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = this.findNodeById(n.children, id);
          if (found) return found;
        }
      }
      return null;
    },
    saveExpandedState() {
      this.expandedNodes.clear();
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          if (node.expanded) {
            this.expandedNodes.add(node.id);
          }
          if (node.children && node.children.length) {
            traverse(node.children);
          }
        });
      };
      traverse(this.ownerServerList);
    },

    restoreExpandedState(nodes) {
      nodes.forEach((node) => {
        if (this.expandedNodes.has(node.id)) {
          node.expanded = true;
        }
        if (node.children && node.children.length) {
          this.restoreExpandedState(node.children);
        }
      });
    },
    async reloadTree() {
      this.ownerTreeLoading = true;
      try {
        this.saveExpandedState();
        const data = await getEntityTreeRaw();
        this.ownerServerList = Array.isArray(data) ? data : [];
        this.restoreExpandedState(this.ownerServerList);
        this.ownerTreeLoaded = true;
      } catch (e) {
        console.error(this.$apiErrorMessage?.(e, "reloadTree failed"), e);
        this.ownerServerList = [];
        this.ownerTreeLoaded = true;
      } finally {
        this.ownerTreeLoading = false;
      }
    },

    handleSelectParameter(node) {
      this.selectedParameterId = node.id;
    },

    handleToggleNode(node) {
      node.expanded = !node.expanded;
      this.pathMapServer = node.parentArr || [];
    },
    fetchParent(node) {
      return "setting1";
    },
    hideLogBar(sign) {
      this.logSign = false;
      const element = this.$refs.contentData;
      element.style.height = "100%";
    },

    showLogBar(sign) {
      this.logSign = true;
      const element = this.$refs.contentData;
      element.style.height = "80%";
      this.$nextTick(() => {
        const elementLog = this.$refs.logBar;
        elementLog.style.height = "20%";
      });
    },

    showLogBarClient(sign) {
      this.logSignClient = true;
      const element = this.$refs.contentDataClient;
      element.style.height = "80%";
      this.$nextTick(() => {
        const elementLog = this.$refs.logBarClient;
        elementLog.style.height = "20%";
      });
    },
    handleParameterTree(node) {
      if (!node) return;
      // Parameter tree moved into Parameter Settings tab.
      this.showParam = false;
      this.paramTreeData = [];
    },
    toggleParamNode(node) {
      if (!node) return;
      node.expanded = !node.expanded;
    },
    handleRenameNode({ id, newName }) {
      const updateNodeName = (nodes) => {
        for (const n of nodes) {
          if (String(n.id) === String(id)) {
            n.name = newName;
            return true;
          }
          if (n.children?.length && updateNodeName(n.children)) return true;
          if (n.childrenFromData?.length && updateNodeName(n.childrenFromData)) return true;
        }
        return false;
      };
      updateNodeName(this.ownerServerList);
      this.$forceUpdate();
    },
    handleCancelRename() {
      this.renamingNodeId = null;
    },
    openSidebar() {
      this.sidebarCollapsed = false;
    },
    collapseSidebar() {
      this.sidebarCollapsed = true;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    setHideOperation(value) {
      this.hideOperationOff = value;
    },

    showLocationRoot() {
      const locationRoot = this.$refs.locationRoot;
      const ownerRoot = this.$refs.ownerRootServer;
      if (locationRoot) {
        locationRoot.style.borderBottom = "2px #aba7a7 solid";
        locationRoot.style.color = "rgba(0, 0, 0, 1)";
      }
      if (ownerRoot) {
        ownerRoot.style.borderBottom = "2px #e6e4e4 solid";
        ownerRoot.style.color = "rgba(0, 0, 0, 0.5)";
      }

      if (this.selectedOwnerNodes.length > 0) {
        const children = this.selectedOwnerNodes[0].children || [];
        this.locationList = children.filter((child) =>
          this.LocationType.includes(child.mode)
        );
        this.selectedLocationNodes = [];
      } else {
        this.locationList = [];
      }

      this.showOwner = false;
    },
    updateSelection(selectedNodes) {
      if (this.showOwner) {
        this.selectedOwnerNodes = selectedNodes;
      } else {
        this.selectedLocationNodes = selectedNodes;
      }
    },
    updateSelectionOwner(node) {
      this.selectedOwnerNodes = [node];
    },
    clearSelectionOwner() {
      this.selectedOwnerNodes = [];
    },
    updateSelectionLocation(node) {
      this.selectedLocationNodes = [node];
    },
    clearSelectionLocation() {
      this.selectedLocationNodes = [];
    },

    clearSelection() {
      if (this.showOwner) {
        this.selectedOwnerNodes = [];
      } else {
        this.selectedLocationNodes = [];
      }
    },
    showOwnerServerRoot() {
      const ownerRoot = this.$refs.ownerRootServer;
      const locationRoot = this.$refs.locationRoot;
      if (ownerRoot) {
        ownerRoot.style.borderBottom = "2px #aba7a7 solid";
        ownerRoot.style.color = "rgba(0, 0, 0, 1)";
      }
      if (locationRoot) {
        locationRoot.style.borderBottom = "2px #e6e4e4 solid";
        locationRoot.style.color = "rgba(0, 0, 0, 0.5)";
      }

      this.showOwner = true;
    },

    async fetchChildren(node) {
      if (node.children && node.children.length > 0) return;

      const children = node.childrenFromData || [];

      Vue.$set(node, "children", children);

      for (const child of children) {
        child.parentNode = node;

        let parentArr = [];
        if (node.parentArr) {
          parentArr = [...node.parentArr];
        } else {
          let current = node.parentNode;
          while (current) {
            parentArr.unshift(current);
            current = current.parentNode;
          }
        }

        parentArr.push(node);
        child.parentArr = parentArr;
      }
    },
    async fetchChildrenServer(node) {
      // Tính parentArr cho node nếu chưa có, tránh gọi lại cho cùng node nhiều lần
      try {
        if (!Array.isArray(node.parentArr) || node.parentArr.length === 0) {
          const quickParents = this.buildParentArrFromNode(node);
          if (quickParents.length) {
            node.parentArr = quickParents;
          }
        }
      } catch (e) {
        console.error(
          "fetchChildrenServer: Error fetching ancestors for node:",
          e
        );
        node.parentArr = node.parentNode ? [node.parentNode] : [];
      }

      if (node.children && node.children.length > 0) return;

      let children = node.childrenFromData || [];

      const seen = new Set();
      children = children.filter((c) => {
        const id = String(c.id).trim();
        if (seen.has(id)) return false;
        seen.add(id);
        c.id = id;
        return true;
      });

      node.children = children;

      // Thiết lập parentNode và parentArr cho con dựa trên parentArr của node cha
      for (const child of node.children) {
        child.parentNode = node;

        if (!Array.isArray(child.parentArr) || child.parentArr.length === 0) {
          const baseAncestors = Array.isArray(node.parentArr)
            ? node.parentArr
            : [];
          const merged = [...baseAncestors, node];

          const uniqParentArr = merged.filter(
            (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx
          );

          child.parentArr = uniqParentArr;
        }
      }

      if (
        this.nextSelectedNode?.id === node.id ||
        this.selectedOwnerNodes[0]?.id === node.id ||
        this.selectedLocationNodes[0]?.id === node.id
      ) {
        this.pathMapServer = node.parentArr
          ? [
            ...node.parentArr.map((parent) => ({
              id: parent.id,
              parent: parent.name,
            })),
            { id: node.id, parent: node.name },
          ]
          : [{ id: node.id, parent: node.name }];
      }
    },
    async hideProperties() {
      this.propertiesSign = false;
      const content = this.$refs.content;
      content.style.width = "100%";
    },

    async showProperties() {
      this.propertiesSign = true;
      const content = this.$refs.content;
      content.style.width = `calc(75% - 5px)`;
    },

    serverSwap(serverSign) {
      if (serverSign == true) {
        this.clientSlide = false;
      } else {
        this.clientSlide = true;
      }
    },

    async updateLocationSyncPage(pageStt) {
      try {
        if (this.optionLocationSync.mode == "update") {
          await ownerAPI
            .getOwnerByRole("OWNER1", pageStt, this.sl)
            .then((res) => {
              if (res != null && res.length != 0) {
                for (let i in res) {
                  res[i].id = res[i].mrid;
                  res[i].parentId = "";
                  res[i].parentName = "";
                  res[i].parentArr = [];
                }
                this.ownerServerList = res;
              }
            });
        }
      } catch (error) {
        this.$notifyApiError?.(error, "Some error occur");
      }
    },

    async showPropertiesData(node) {
      if (ENERGY_MONITORING_MODES.has(node?.mode)) {
        this.openEnergyMonitoringTab(node);
      }

      // Default properties view
      this.propertiesPaneTab = "object";
      this.handleControlBlockUpdate(node);

      this.selectedOwnerNodes = [node];
      this.refreshProps();
      this.assetPropertySign = true;
      this.jobPropertySign = true;

      let iedId = null;
      if (node.mode === "ied") {
        iedId = node.id;
      } else if (
        node.mode === "protectionFunction" ||
        node.mode === "protectionLevel" ||
        node.mode === "protectionGroup" ||
        node.mode === "settingFunction" ||
        node.mode === "systemSetting" ||
        node.mode === "lineParameters"
      ) {
        const ancestorIed = getAncestorByMode(
          this.ownerServerList,
          node.id,
          "ied"
        );
        if (ancestorIed) {
          iedId = ancestorIed.id;
        }
      }

      if (iedId) {
        try {
          const cacheKey = String(iedId);
          let deviceInfo = this.iedInfoCache[cacheKey];
          if (!deviceInfo) {
            deviceInfo = await getIedInfoById(iedId);
            this.iedInfoCache[cacheKey] = deviceInfo || {};
          }

          this.Information = {
            name: deviceInfo.name || "",
            description: deviceInfo.description || "",
            vendor: deviceInfo.vendor || "",
            model: deviceInfo.model || "",
            serialNumber: deviceInfo.serialNumber || "",
            hardwareVersion: deviceInfo.hardwareVersion || "",
            softwareVersion: deviceInfo.softwareVersion || "",
            orderCode: deviceInfo.orderCode || "",
            roles: deviceInfo.role || "",
          };
        } catch (err) {
          console.error(this.$apiErrorMessage?.(err, "Không lấy được thông tin device"), err);
          this.Information = {
            name: node.name || "",
            description: node.description || "",
            vendor: node.vendor || "",
            model: node.model || "",
            serialNumber: node.serialNumber || "",
            hardwareVersion: node.hardwareVersion || "",
            softwareVersion: node.softwareVersion || "",
            orderCode: node.orderCode || "",
            roles: node.roles || "",
          };
        }
      }

      this.properties = await getPropertiesById(this.ownerServerList, node.id);

      if (!node.parentArr) {
        try {
          const quickParents = this.buildParentArrFromNode(node);
          if (quickParents.length) {
            node.parentArr = quickParents;
          } else {
            const ancestors = await getAncestorsById(
              this.ownerServerList,
              node.id
            );
            node.parentArr = [...ancestors];
          }
        } catch (e) {
          console.error(this.$apiErrorMessage?.(e, "showPropertiesData: Error fetching ancestors"), e);
          node.parentArr = [];
        }
      }
      this.pathMapServer = node.parentArr
        ? [
          ...node.parentArr.map((parent) => ({
            id: parent.id,
            parent: parent.name,
          })),
          { id: node.id, parent: node.name },
        ]
        : [{ id: node.id, parent: node.name }];
    },

    updateSelectionOwner(node) {
      this.selectedOwnerNodes = [node];
      if (!node.parentArr) {
        try {
          const quickParents = this.buildParentArrFromNode(node);
          if (quickParents.length) {
            node.parentArr = quickParents;
          } else {
            const ancestors = getAncestorsById(this.ownerServerList, node.id);
            node.parentArr = [...ancestors];
          }
        } catch (e) {
          console.error("updateSelectionOwner: Error fetching ancestors:", e);
          node.parentArr = [];
        }
      }
      this.pathMapServer = node.parentArr
        ? [
          ...node.parentArr.map((parent) => ({
            id: parent.id,
            parent: parent.name,
          })),
          { id: node.id, parent: node.name },
        ]
        : [{ id: node.id, parent: node.name }];
    },

    updateSelectionLocation(node) {
      this.selectedLocationNodes = [node];
      if (!node.parentArr) {
        try {
          const quickParents = this.buildParentArrFromNode(node);
          if (quickParents.length) {
            node.parentArr = quickParents;
          } else {
            const ancestors = getAncestorsById(this.ownerServerList, node.id);
            node.parentArr = [...ancestors];
          }
        } catch (e) {
          console.error(
            "updateSelectionLocation: Error fetching ancestors:",
            e
          );
          node.parentArr = [];
        }
      }
      this.pathMapServer = node.parentArr
        ? [
          ...node.parentArr.map((parent) => ({
            id: parent.id,
            parent: parent.name,
          })),
          { id: node.id, parent: node.name },
        ]
        : [{ id: node.id, parent: node.name }];
    },

    async removeOwner(node) {
      this.ownerServerList = this.ownerServerList.filter(
        (owner) => owner.id !== node.id
      );
      this.$message.success(this.$tUi('removeOwnerSuccess'));
    },
    async removeAsset(node) {
      this.ownerServerList.forEach((owner) => {
        if (owner.children) {
          owner.children = owner.children.filter((c) => c.id !== node.id);
        }
      });
      this.$message.success(this.$tUi('removeAssetSuccess'));
    },
    async removeLocation(node) {
      this.ownerServerList.forEach((owner) => {
        if (owner.children) {
          owner.children = owner.children.filter((c) => c.id !== node.id);
        }
      });
      this.$message.success(this.$tUi('removeLocationSuccess'));
    },
    refreshProps() {
      this.properties = this.selectedId
        ? getPropertiesById(this.ownerServerList, this.selectedId)
        : EMPTY_PROPS();
    },
  },
  async mounted() {
    this.ownerTreeLoading = true;
    try {
      const data = await getEntityTreeRaw();
      if (Array.isArray(data)) {
        this.ownerServerList = data;
      } else {
        console.warn("API trả về dữ liệu không phải mảng:", data);
        this.ownerServerList = [];
      }
      this.ownerTreeLoaded = true;
    } catch (err) {
      this.$notifyApiError?.(err, "Không tải được dữ liệu cây");
      this.ownerServerList = [];
      this.ownerTreeLoaded = true;
    } finally {
      this.ownerTreeLoading = false;
    }
  },
  beforeUnmount() {
    if (this._resizeServerFrame) cancelAnimationFrame(this._resizeServerFrame);
    if (this._resizeContentFrame) cancelAnimationFrame(this._resizeContentFrame);
    if (this._resizeOwnerFrame) cancelAnimationFrame(this._resizeOwnerFrame);
    if (this._resizeSclFrame) cancelAnimationFrame(this._resizeSclFrame);
    if (this._resizeParamFrame) cancelAnimationFrame(this._resizeParamFrame);
  },
  beforeMount() { },
  watch: {
    selectedId() {
      this.refreshProps();
    },
    ownerServerList: {
      handler() {
        this.refreshProps();
      },
      deep: true,
    },
    showSCL(val) {
      if (val) {
        this.sidebarWidthPercent = Math.max(this.sidebarWidthPercent, 40);
        this.internalOwnerWidthPercent = 50;
      } else {
        this.sidebarWidthPercent = Math.min(this.sidebarWidthPercent, 20);
        this.internalOwnerWidthPercent = 100;
      }
    }
  },
};
