<template>
  <div :class="['explorer', { 'is-resizing': resizing }]">
    <input
      ref="sclFileInput"
      type="file"
      accept=".scl,.scd,.icd,.cid,.xml"
      style="display: none"
      @change="onSclFileSelected"
    />
      <div class="main-layout">
        <div class="activity-bar-fixed">
          <ActivityBar
            :active-view="activeView"
            @view-change="setActiveView"
          />
        </div>

        <div class="main-column">
          <div class="activity-bar-wrapper">
            <div class="resizable-sidebar">
        <!-- Sidebar Server -->
        <div
          ref="sidebarServer"
          :class="['sidebar', { collapsed: sidebarCollapsed, 'no-transition': resizing }]"
          :style="sidebarCollapsed ? { width: '0px', minWidth: '0px' } : { width: sidebarTotalWidthPx + 'px' }"
        >
          <!-- Explorer View (Tree View) -->
          <div v-show="activeView === 'explorer'" style="display: flex; height: 100%; width: 100%; overflow: hidden;">
           <div ref="ownerPane" class="sidebar-pane" :style="{ flex: 'none', width: ownerWidthPx + 'px', height: '100%', display: 'flex', flexDirection: 'column', minWidth: '0', position: 'relative' }">
            <div class="title-temp" v-if="!sidebarCollapsed">
              <div ref="tabContainer" class="tab-container tab-with-actions">
                <div ref="ownerRootServer" @click="showOwnerServerRoot" class="tab">
                  Monitoring
                </div>
              </div>
            </div>

            <div v-if="showOwner" class="child-nav">
              <div v-if="ownerTreeLoading" class="empty-owner-message">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>{{ $tUi('loadingOwnerTree') }}</p>
              </div>
              <div v-else-if="ownerTreeLoaded && !renderOwnerList.length" class="empty-owner-message">
                <p>{{ $tUi('noOrganisationFound') }}</p>
              </div>
              <ul v-else-if="renderOwnerList.length">
                <TreeNode
                  v-for="item in renderOwnerList"
                  :key="item.id"
                  :node="item"
                  :selectedNodes="selectedNodes"
                  :selectedParameterId="selectedParameterId"
                  :hide-operation-off="hideOperationOff"
                  :enable-drag-move="true"
                  @select-parameter="handleSelectParameter"
                  @fetch-children="fetchChildrenServer"
                  @show-properties="showPropertiesData"
                  @update-selection="updateSelectionOwner"
                  @clear-selection="clearSelectionOwner"
                  @open-context-menu="openContextMenu"
                  @toggle-node="handleToggleNode"
                  @node-dblclick="handleNodeDblClick"
                  @request-tree-refresh="reloadTree"
                  :renaming-node-id="renamingNodeId"
                  @rename-node="handleRenameNode"
                  @cancel-rename="handleCancelRename"
                />
              </ul>
            </div>

            <div v-else class="child-nav">
              <div
                v-if="!selectedOwnerNodes.length"
                class="no-selection-message"
              ></div>
              <div v-else-if="!locationList.length" class="empty-location-message">
                <p
                  style="
                    padding: 20px;
                    text-align: center;
                    color: #666;
                    font-style: italic;
                  "
                >
                  {{
                    $t("ownerHasNoLocations", {
                      ownerName: selectedOwnerNodes[0].name,
                    })
                  }}
                </p>
              </div>
              <ul v-else>
                <TreeNode
                  v-for="item in locationList"
                  :key="item.id"
                  :node="item"
                  :selectedNodes="selectedNodes"
                  :hide-operation-off="hideOperationOff"
                  :enable-drag-move="true"
                  @fetch-children="fetchChildrenServer"
                  @show-properties="showPropertiesData"
                  @update-selection="updateSelectionLocation"
                  @clear-selection="clearSelectionLocation"
                  @open-context-menu="openContextMenu"
                  @request-tree-refresh="reloadTree"
                  :renaming-node-id="renamingNodeId"
                  @rename-node="handleRenameNode"
                  @cancel-rename="handleCancelRename"
                />
              </ul>
            </div>
          </div>

          <div
            v-if="showSCL && !sidebarCollapsed"
            @mousedown="startResizeOwner"
            class="resizer-handle"
            :title="$tUi('resizeOwnerTree')"
          ></div>

          <div v-if="showSCL && !sidebarCollapsed" ref="sclPane" class="sidebar-pane" :style="{ flex: 'none', width: sclWidthPx + 'px', height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ddd', minWidth: '0', backgroundColor: 'white' }">
            <div class="title-temp scl-pane-header" style="padding-right: 10px; align-items: center;">
              <div class="tab-container">
                <div class="tab">
                  {{ $tUi('sclManagementFor', { name: sclTargetName }) }}
                </div>
              </div>
              <div style="cursor: pointer;" @click="showSCL = false" :title="$tUi('close')">
                <i class="fa-solid fa-xmark"></i>
              </div>
            </div>
            <div class="scl-pane-body">
              <SCLManage mode="ied" @control-block-update="handleControlBlockUpdate" />
            </div>
          </div>
          <div
            v-if="showSCL && !sidebarCollapsed"
            @mousedown="startResizeScl"
            class="resizer"
            :title="$tUi('resizeSclPane')"
          ></div>

          <div v-if="false" ref="paramPane" class="sidebar-pane" :style="{ flex: 'none', width: paramWidthPx + 'px', height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #ddd', minWidth: '0', backgroundColor: 'white' }">
            <div class="title-temp" style="padding-right: 10px; align-items: center; position: relative;">
              <div class="visibility-actions header-actions">
                <i
                  class="fa-solid fa-eye toggle-icon"
                  :class="{ active: !hideOperationOff }"
                  @click.stop="setHideOperation(false)"
                  :title="$tUi('showOperationOn')"
                ></i>
                <i
                  class="fa-solid fa-eye-slash toggle-icon"
                  :class="{ active: hideOperationOff }"
                  @click.stop="setHideOperation(true)"
                  :title="$tUi('hideOperationOff')"
                ></i>
              </div>
              <div class="tab-container"><div class="tab">{{ $tUi('parameterSetting') }}</div></div>
              <div style="cursor: pointer;" @click="showParam = false" :title="$tUi('close')">
                <i class="fa-solid fa-xmark"></i>
              </div>
            </div>
            <div class="child-nav">
              <div v-if="paramLoading" class="scl-loading">{{ $tUi('loadingParamTree') }}</div>
              <div v-else-if="!paramTreeData.length" class="empty-location-message" style="padding: 12px; color: #666;">
                {{ $tUi('paramTreeNotLoaded') }}
              </div>
              <ul v-else>
                <TreeNode
                  v-for="item in paramTreeData"
                  :key="item.id"
                  :node="item"
                  :selectedNodes="selectedNodes"
                  :selectedParameterId="selectedParameterId"
                  :hide-operation-off="hideOperationOff"
                  @select-parameter="handleSelectParameter"
                  @fetch-children="noopFetchChildren"
                  @show-properties="showPropertiesData"
                  @update-selection="updateSelectionOwner"
                  @clear-selection="clearSelectionOwner"
                  @open-context-menu="openContextMenuParam"
                  @toggle-node="toggleParamNode"
                  @node-dblclick="handleNodeDblClick"
                  :renaming-node-id="renamingNodeId"
                  @rename-node="handleRenameNode"
                  @cancel-rename="handleCancelRename"
                />
              </ul>
            </div>
          </div>

          <div
            v-if="false"
            @mousedown="startResizeParam"
            class="resizer"
            :title="$tUi('resizeParamPane')"
          ></div>
          </div>

          <div v-show="activeView === 'setting'" class="setting-sidebar-view">
            <div class="setting-menu">
              <div
                v-for="group in settingMenuGroups"
                :key="group.id"
                class="setting-menu-group"
              >
                <button
                  type="button"
                  class="setting-menu-group-header"
                  :class="{ collapsed: !group.expanded }"
                  @click="toggleSettingGroup(group)"
                >
                  <i
                    class="fa-solid setting-menu-toggle"
                    :class="group.expanded ? 'fa-square-minus' : 'fa-square-plus'"
                  ></i>
                  <span>{{ group.label }}</span>
                </button>

                <div v-show="group.expanded" class="setting-menu-children">
                  <button
                    v-for="item in group.children"
                    :key="item.id"
                    type="button"
                    class="setting-menu-item"
                    :class="{ active: activeSettingMenuItem === item.id }"
                    @click="selectSettingMenuItem(item)"
                  >
                    <span>{{ item.label }}</span>
                    <i
                      v-if="activeSettingMenuItem === item.id"
                      class="fa-solid fa-caret-right setting-menu-active-arrow"
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-show="activeView === 'sclImport'" class="activity-view-container">
            <SCLManage
              mode="global"
              layout="tree"
              @open-context-menu="openContextMenu"
              @control-block-update="handleControlBlockUpdate"
            />
          </div>

        </div>
      <!-- Collapsed Handle moved to ActivityBar -->
      <div
        @mousedown="startResizeServer"
        v-if="!clientSlide && !sidebarCollapsed && activeView !== 'overview'"
        ref="resizerServer"
        class="resizer"
      ></div>
      <div
        ref="contextDataServer"
        v-show="!clientSlide"
        :class="['context-data', { 'full-width': sidebarCollapsed || activeView === 'overview' }]"
        :style="(sidebarCollapsed || activeView === 'overview') ? { width: '100%' } : {}"
      >
        <div ref="contentData" class="content-data">
          <div ref="content" class="content">
            <template v-if="activeView === 'overview'">
              <div class="overview-direct-page">
                <div class="overview-direct-title">
                  <div>
                    <div class="overview-direct-heading">Overview</div>
                    <div class="overview-direct-subtitle">Mock overview data</div>
                  </div>
                  <div class="overview-direct-time">2026-07-01 16:22</div>
                </div>

                <div class="overview-direct-body">
                  <div class="overview-plant-panel">
                    <div class="overview-plant-icon">
                      <i class="fa-solid fa-solar-panel"></i>
                    </div>
                    <div class="overview-plant-table">
                      <div class="overview-plant-row">
                        <span>Plant name</span>
                        <strong>Site 1</strong>
                      </div>
                      <div class="overview-plant-row">
                        <span>Plant address</span>
                        <strong>Demo address</strong>
                      </div>
                      <div class="overview-plant-row">
                        <span>Number of inverters</span>
                        <strong>4</strong>
                      </div>
                      <div class="overview-plant-row">
                        <span>Total rated power</span>
                        <strong>400.000kW</strong>
                      </div>
                    </div>
                  </div>

                  <div class="overview-metric-table">
                    <div
                      v-for="metric in [
                        { label: 'Active power', value: '73.82kW' },
                        { label: 'Reactive power', value: '0.81kVar' },
                        { label: 'Load power', value: '424.53kW' },
                        { label: 'Grid-tied active power', value: '350.70kW' },
                        { label: 'Grid-tied reactive power', value: '109.20kVar' },
                        { label: 'Energy yield of current day', value: '1.22MWh' },
                        { label: 'Current Day Consumption', value: '5.96MWh' },
                        { label: 'Current Day Feed-in to Grid', value: '0.00kWh' },
                        { label: 'Current Day Supply From Grid', value: '4.74MWh' },
                        { label: 'Total energy yield', value: '253.72MWh' },
                      ]"
                      :key="metric.label"
                      class="overview-metric-cell"
                    >
                      <div class="overview-metric-label">{{ metric.label }}</div>
                      <div class="overview-metric-value">{{ metric.value }}</div>
                    </div>
                  </div>

                  <div class="overview-chart-panel">
                    <div class="overview-chart-axis overview-chart-y"></div>
                    <div class="overview-chart-axis overview-chart-x"></div>
                    <svg viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true">
                      <polyline
                        points="0,145 60,138 120,118 180,132 240,88 300,102 360,54 420,98 480,80 540,116 600,90"
                        fill="none"
                        stroke="#4aa3a2"
                        stroke-width="3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="activeView === 'setting'">
              <component :is="activeSettingComponent" />
            </template>
            <template v-else>
              <div class="title-content"></div>
              <div class="content-content">
              <Tabs
                ref="tabsServer"
                :side="'server'"
                :tree="ownerServerList"
                v-model="activeTab"
                :tabs="tabs"
                @refresh-tree="reloadTree"
                @close-tab="removeTab"
                @update-focus="handleUpdateFocus"
                @open-context-menu="openContextMenu"
                @node-dblclick="handleNodeDblClick"
                @control-block-update="handleControlBlockUpdate"
              />
              </div>
            </template>
          </div>
           <div
             v-if="activeView !== 'overview'"
             @mousedown="startResizeContentServer"
             ref="resizerContentServer"
             class="resizer"
           ></div>
        </div>
      </div>
            </div> <!-- Close resizable-sidebar -->
          </div> <!-- Close activity-bar-wrapper -->
        </div> <!-- Close main-column -->
      </div> <!-- Close main-layout -->

    <ContextMenu
      v-if="contextMenuVisible"
      :visible="contextMenuVisible"
      :position="contextMenuPosition"
      :selectedNode="rightClickNode"
      @refresh-tree="reloadTree"
      @close="closeContextMenu"
    />

  </div>
</template>

<script src="./treeNavigation.script.js"></script>

<style scoped>
/* style.css */
.explorer {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  font-size: 12px;
  height: calc(100vh - 4vh - 2.5vh);
  display: flex;
  flex-direction: column;
}
.context-menu {
  position: fixed;
  z-index: 1000;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  min-width: 220px;
  padding: 8px 0;
  font-family: "Segoe UI", sans-serif;
  max-height: 80vh;
  /* overflow-y: auto; */
}

.activity-bar-wrapper {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.main-layout {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  padding-left: 48px;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  background-attachment: fixed;
  background-size: 100% 100vh;
  background-position: 0 0;
}

.activity-bar-fixed {
  position: fixed;
  top: calc(4vh - 2px);
  left: 0;
  bottom: 0;
  width: 48px;
  z-index: 10000;
}

.activity-bar-fixed :deep(.activity-bar) {
  height: 100%;
}

.main-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  border-radius: 14px 0 0 14px;
  overflow: hidden;
  background: #f5f5f5;
}

.main-column::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.main-column > * {
  position: relative;
  z-index: 1;
}

.resizable-sidebar {
  display: flex;
  height: 100%;
  position: relative;
  width: 100%;
  flex: 1;
}

.activity-view-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.sidebar {
  width: 20%;
  background: #f7fbff;
  color: #31435c;
  flex-shrink: 0;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: inset -1px 0 0 #d7e4f5;
}
.sidebar.no-transition {
  transition: none !important;
}
.explorer.is-resizing {
  user-select: none !important;
}
.explorer.is-resizing * {
  pointer-events: none !important;
}
.explorer.is-resizing .resizer {
  pointer-events: auto !important;
}
.explorer.is-resizing .resizer-handle {
  pointer-events: auto !important;
}
.resizer-handle {
  width: 4px;
  cursor: col-resize;
  background-color: transparent;
  flex-shrink: 0;
  transition: background-color 0.2s;
  z-index: 10;
}
.resizer-handle:hover {
  background-color: #0078d4;
}
.sidebar.collapsed {
  width: 0;
  min-width: 0;
  overflow: hidden;
}

.sidebar ul {
  list-style: none;
  padding-left: 20px;
  height: 100%;
}

.sidebar li {
  margin: 5px 0;
  cursor: pointer;
}

.sidebar .folder,
.sidebar .file {
  display: block;
  padding: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.sidebar .folder:hover,
  .sidebar .file:hover {
    background-color: #555;
    color: white;
  }

.sidebar .folder i,
.sidebar .file i {
  margin-right: 8px; /* Khong cch gia icon v vn bn */
  width: 16px; /* Kch thc icon */
  text-align: center;
  font-size: 12px; /* C ch cho icon */
}

.resizer {
  width: 5px;
  background-color: white;
  cursor: ew-resize; /* Con tr i thnh mi tn ko ngang */
}

.content {
  flex: 1;
  min-width: 0;
  background-color: white;
  font-size: 12px; /* C ch cho ni dung */
  box-sizing: border-box;
}

.title-content {
  width: 100%;
  height: 5px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.content-content {
  width: 100%;
  height: calc(100% - 5px);
  box-sizing: border-box;
  border: 1px rgb(224, 222, 222) solid;
  border-bottom: none;
  overflow: hidden;
}

.content-content:hover {
  overflow: auto;
}

.overview-direct-page {
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  color: #333;
  font-size: 13px;
}

.overview-direct-title {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border: 1px solid #dcdcdc;
  border-bottom: none;
  box-sizing: border-box;
  background: #f7f7f7;
}

.overview-direct-heading {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.overview-direct-subtitle,
.overview-direct-time {
  margin-top: 2px;
  color: #777;
  font-size: 12px;
}

.overview-direct-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  border: 1px solid #dcdcdc;
  box-sizing: border-box;
  background: #fff;
}

.overview-plant-panel {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  border: 1px solid #d9d9d9;
  background: #fff;
}

.overview-plant-icon {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #d9d9d9;
  background: #eef3f8;
  color: #1e3c72;
  font-size: 58px;
}

.overview-plant-table {
  display: grid;
  grid-template-columns: 1fr;
}

.overview-plant-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  min-height: 34px;
  border-bottom: 1px solid #e5e5e5;
}

.overview-plant-row:last-child {
  border-bottom: none;
}

.overview-plant-row span,
.overview-plant-row strong {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-sizing: border-box;
  font-weight: 400;
}

.overview-plant-row span {
  border-right: 1px solid #e5e5e5;
}

.overview-metric-table {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-top: 10px;
  border: 1px solid #d9d9d9;
  border-right: none;
  border-bottom: none;
}

.overview-metric-cell {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #d9d9d9;
  border-bottom: 1px solid #d9d9d9;
  background: #fff;
  text-align: center;
}

.overview-metric-label {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  box-sizing: border-box;
  background: #f0f0f0;
  color: #333;
  font-weight: 700;
}

.overview-metric-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #078822;
  font-size: 20px;
  font-weight: 700;
}

.overview-chart-panel {
  position: relative;
  height: 250px;
  margin-top: 14px;
  border: 1px solid #d9d9d9;
  background: #f8fbff;
  overflow: hidden;
}

.overview-chart-panel svg {
  position: absolute;
  left: 56px;
  right: 16px;
  top: 28px;
  bottom: 34px;
  width: calc(100% - 72px);
  height: calc(100% - 62px);
}

.overview-chart-axis {
  position: absolute;
  background: #7288af;
}

.overview-chart-y {
  left: 56px;
  top: 28px;
  width: 1px;
  height: calc(100% - 62px);
}

.overview-chart-x {
  left: 56px;
  right: 16px;
  bottom: 34px;
  height: 1px;
}

@media (max-width: 980px) {
  .overview-plant-panel {
    grid-template-columns: 180px minmax(0, 1fr);
  }

  .overview-metric-table {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .overview-plant-panel,
  .overview-plant-row {
    grid-template-columns: 1fr;
  }

  .overview-plant-icon,
  .overview-plant-row span {
    border-right: none;
  }

  .overview-plant-row span {
    border-bottom: 1px solid #e5e5e5;
    background: #f7f7f7;
  }

  .overview-metric-table {
    grid-template-columns: 1fr;
  }
}

.folder-item {
  text-align: center;
  padding: 10px;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 12px;
}

.folder-item:hover {
  background-color: #f0f0f0;
}
.child-nav {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 8px 8px 12px;
  background: #f7fbff;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.child-nav::-webkit-scrollbar {
  display: none;
}

.overview-sidebar-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.overview-menu {
  flex: 1;
  padding: 10px 8px;
  box-sizing: border-box;
  overflow-y: auto;
}

.overview-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  margin-bottom: 6px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  color: #555;
  cursor: pointer;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
}

.overview-menu-item:hover {
  background: #f5f5f5;
}

.overview-menu-item.active {
  background: #eef3fb;
  border-color: #b9c7dc;
  color: #1e3c72;
}

.overview-menu-dot {
  font-size: 8px;
  color: #9ca3af;
}

.overview-menu-item.active .overview-menu-dot {
  color: #1e3c72;
}

.setting-sidebar-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f7fbff;
  color: #1f2f46;
  box-shadow: inset -1px 0 0 #d7e4f5;
}

.setting-menu {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 8px 12px;
  box-sizing: border-box;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.setting-menu::-webkit-scrollbar {
  display: none;
}

.setting-menu-group {
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid #d8e5f6;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 2px 7px rgba(41, 73, 116, 0.08);
}

.setting-menu-group-header {
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 11px;
  border: none;
  border-bottom: 1px solid #dbe7f6;
  background: linear-gradient(180deg, #f9fcff 0%, #e8f1fc 100%);
  color: #1e3c72;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
}

.setting-menu-group-header.collapsed {
  border-bottom: none;
  background: linear-gradient(180deg, #fff 0%, #edf5ff 100%);
}

.setting-menu-toggle {
  width: 12px;
  font-size: 11px;
  color: #4d78ad;
}

.setting-menu-children {
  background: #fff;
}

.setting-menu-item {
  position: relative;
  width: 100%;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px 0 34px;
  border: none;
  border-bottom: 1px solid #edf2f8;
  background: #fff;
  color: #31435c;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.setting-menu-item:last-child {
  border-bottom: none;
}

.setting-menu-item:hover {
  background: #f0f6ff;
  color: #1e3c72;
}

.setting-menu-item.active {
  color: #123c75;
  background: linear-gradient(90deg, #dcecff 0%, #eef6ff 78%, #fff 100%);
  box-shadow: inset 3px 0 0 #1f6fc7;
}

.setting-menu-active-arrow {
  position: absolute;
  right: 9px;
  color: #8db7e8;
}

.empty-owner-message {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}

.empty-owner-message p {
  margin: 0;
  font-size: 12px;
}

.empty-owner-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 240px;
  padding: 11px 18px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(180deg, #315aa1 0%, #24498f 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(36, 73, 143, 0.28);
  transition: transform 0.15s ease, filter 0.15s ease;
}

.empty-owner-add-btn:hover {
  filter: brightness(1.06);
}

.empty-owner-add-btn:active {
  transform: translateY(1px);
}

.sidebar.collapsed .child-nav {
  display: none;
}
.title-node {
  margin-top: 50px;
}
.title-temp {
  height: 40px;
  color: #1e3c72;
  font-weight: 600;
  display: flex;
  position: relative;
  flex-direction: row;
  box-sizing: border-box;
  border-bottom: 1px solid #dbe7f6;
  background: linear-gradient(180deg, #f9fcff 0%, #e8f1fc 100%);
}
.context-data {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
  height: 100%;
}
.context-data.full-width {
  width: 100%;
}

.content-data {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  display: flex;
}

.log-bar {
  box-sizing: border-box;
  width: 100%;
  height: 20%;
  border: 1px rgb(224, 222, 222) solid;
}

.hide-icon i {
  visibility: hidden;
}

.hide-icon:hover i {
  visibility: visible;
}

.tab-container {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.tab-with-actions {
  justify-content: center;
  gap: 8px;
}
.tab-with-actions .tab {
  flex: 1;
  width: 100%;
}
.visibility-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}
.header-actions {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
}
.scl-pane-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.collapse-btn {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: #f3f3f3;
  border: 1px solid #d3d3d3;
  border-radius: 10px;
  padding: 4px 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  z-index: 3;
}

.collapse-btn i {
  font-size: 12px;
  color: #555;
}

.collapse-btn:hover {
  background: #e6e6e6;
}
.toggle-icon {
  color: #9c9c9c;
  cursor: pointer;
  font-size: 14px;
}
.toggle-icon.active {
  color: #4a4a4a;
}
.toggle-icon:hover {
  color: #007bff;
}
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: 6px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  background: #f5f5f5;
  border: 1px solid #d3d3d3;
  border-radius: 12px;
  cursor: pointer;
  font-size: 11px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  user-select: none;
  color: #333;
}
.sidebar-toggle .arrow {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}
.sidebar-toggle .label {
  font-weight: 600;
  color: #333;
}
.collapsed-bar {
  width: 16px;
  min-width: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #f0f0f0;
  border-right: 1px solid #d3d3d3;
  cursor: pointer;
  user-select: none;
  box-shadow: inset -1px 0 2px rgba(0, 0, 0, 0.06);
}
.collapsed-bar .arrow {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}
.collapsed-bar .label {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-weight: 600;
  font-size: 11px;
  color: #333;
}

.collapsed-handle-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  z-index: 20;
}

.collapsed-handle {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 40px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border: 1px solid rgba(0, 198, 255, 0.3);
  border-left: none;
  border-radius: 0 20px 20px 0;
  box-shadow: 3px 0 12px rgba(0, 0, 0, 0.3), inset 1px 1px 0 rgba(255, 255, 255, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  z-index: 100;
}

.collapsed-handle:hover {
  width: 40px;
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
  box-shadow: 5px 0 18px rgba(0, 210, 255, 0.4);
}

.collapsed-handle.expanded {
  background: linear-gradient(135deg, #0f2027 0%, #203a43 100%);
  border-color: rgba(255, 255, 255, 0.2);
}

.handle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
}

.handle-icon {
  color: #00d2ff;
  font-size: 14px;
  filter: drop-shadow(0 0 5px rgba(0, 210, 255, 0.8));
  transition: transform 0.4s ease;
}

.collapsed-handle:hover .handle-icon {
  color: #fff;
  transform: rotate(360deg) scale(1.2);
}

.handle-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  user-select: none;
  color: #e0e0e0;
  font-weight: 800;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.location {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 5px;
  cursor: pointer;
  border-bottom: 2px #e6e4e4 solid;
  box-sizing: border-box;
}

.tab {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  padding-left: 5px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 2px #e6e4e4 solid;
}

.trapezoid {
  position: absolute;
  top: 50%; /* Cn gia theo chiu dc */
  right: 0; /* y st mp phi */
  transform: translateY(-50%); /* Cn gia theo chiu dc */
  width: 1vh !important; /*  rng */
  height: 10vh; /*  cao */
  background: #d9d9d9;
  clip-path: polygon(100% 0%, 100% 100%, 0% 80%, 0% 20%);
}

.page-align {
  width: 100%;
  height: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
}

.path-hover:hover {
  color: black;
  text-decoration: underline;
  cursor: pointer;
}
</style>

<style scoped>
.dropdown {
  width: 35%;
  margin-right: 10px;
}

.dropdown-input {
  width: 100%;
  padding-right: 80px;
  cursor: pointer;
  background-color: #fff;
  padding: 0 0 0 10px;
  height: 40px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
  margin: 5px 0;
  list-style: none;
  display: none;
  z-index: 10;
}

.dropdown-menu li {
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-menu li:hover {
  background-color: #f0f0f0;
}
</style>

<style scoped>
.fixed-box {
  box-sizing: border-box;
}

.pl10 {
  padding-left: 10px;
}

.pt10 {
  padding-top: 10px;
}

.pb10 {
  padding-bottom: 10px;
}

.break-word {
  word-break: break-word;
}

:deep(.asset-info-dialog .el-dialog__header) {
  display: none;
}

:deep(.el-dialog.asset-info-dialog) {
  padding: 0;
  background: transparent;
  box-shadow: none;
}

:deep(.asset-info-dialog .el-dialog__body) {
  padding: 0;
  background: transparent;
  overflow: hidden;
}

:deep(.el-dialog.page-node-dialog) {
  max-width: 1980px;
  margin: 0 !important;
  border-radius: 12px;
}

:deep(.page-node-dialog .el-dialog__body) {
  overflow: hidden;
}

.node-dialog-view {
  display: flex;
  flex-direction: column;
  height: min(720px, calc(100vh - 24px));
  max-height: calc(100vh - 24px);
  overflow: hidden;
  border: 1px solid rgba(191, 219, 254, 0.9);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
}

.node-dialog-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: linear-gradient(135deg, #1e3a8a 0%, #34518f 100%);
  color: #ffffff;
  flex-shrink: 0;
}

.node-dialog-topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.node-dialog-mode-badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border: 1px solid rgba(191, 219, 254, 0.28);
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.09);
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.node-dialog-title {
  min-width: 0;
  overflow: hidden;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-dialog-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.node-dialog-close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.node-dialog-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 24px;
  background: #ffffff;
}

.node-dialog-body--flush {
  padding: 0;
  background: #f8fafc;
}

:deep(.node-dialog-body .el-form) {
  max-width: 1180px;
  margin: 0 auto;
}

@media (max-width: 900px) {
  :deep(.el-dialog.page-node-dialog) {
    width: calc(100vw - 24px) !important;
  }

  .node-dialog-view {
    height: calc(100vh - 24px);
    max-height: calc(100vh - 24px);
  }

  .node-dialog-topbar {
    height: 58px;
    padding: 0 16px;
  }

  .node-dialog-title {
    font-size: 16px;
  }

  .node-dialog-body {
    padding: 16px;
  }

  .node-dialog-body--flush {
    padding: 0;
  }
}

@media (max-height: 640px) {
  .node-dialog-view {
    height: calc(100vh - 16px);
    max-height: calc(100vh - 16px);
  }

  .node-dialog-topbar {
    height: 52px;
  }

  .node-dialog-body {
    padding: 12px;
  }

  .node-dialog-body--flush {
    padding: 0;
  }
}
</style>
