<template>
  <div class="device-detail-card">
    <ElCard :body-style="{ padding: '0px' }" shadow="hover" class="art-custom-card">
      <div class="content">
        <div class="title">
          <span>{{ deviceDetail.name }}</span>
          <span class="category">
            {{ deviceDetail.deviceId }}
          </span>
          <ElTag style="margin-left: 10px" :type="getOnlineTagType(deviceDetail.isOnline)">
            {{ buildOnlineTagText(deviceDetail.isOnline) }}
          </ElTag>
        </div>
        <ElDescriptions direction="vertical">
          <ElDescriptionsItem label="所属产品">
            {{ deviceDetail.productName }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建">
            {{ deviceDetail.creator }} /
            {{ timestampToTime(deviceDetail.createdAt, false) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="修改">
            {{ deviceDetail.editor }} /
            {{ timestampToTime(deviceDetail.updatedAt, false) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="最后在线时间">
            {{
              deviceDetail.lastOnlineTime
                ? timestampToTime(deviceDetail.lastOnlineTime, false)
                : '-'
            }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="IP地址">
            {{ deviceDetail.ip || '-' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="描述">
            {{ deviceDetail.description }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>
  </div>
  <div class="device-manager-tabs">
    <ElCard :body-style="{ padding: '0px' }" shadow="hover" class="art-custom-card">
      <el-tabs v-model="activeName" class="device-tabs" @tab-click="handleClick">
        <el-tab-pane label="设备监控" name="monitor">
          <DeviceMonitor
            v-if="deviceDetail.deviceId != ''"
            :product-id="deviceDetail.productId"
            :device-id="deviceDetail.deviceId"
          />
        </el-tab-pane>
        <el-tab-pane label="功能数据" name="funcModelData">功能数据</el-tab-pane>
        <el-tab-pane label="终端" name="webTerm" :lazy="true">
          <WebTerm
            v-if="deviceDetail.deviceId != ''"
            :product-id="deviceDetail.productId"
            :device-id="deviceDetail.deviceId"
          />
        </el-tab-pane>
      </el-tabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { DeviceService } from '@/api/deviceApi'
  import { useRoute } from 'vue-router'
  import { defineOptions, onMounted, ref } from 'vue'
  import { timestampToTime } from '@/utils'
  import type { TabsPaneContext } from 'element-plus'
  import DeviceMonitor from './monitor/index.vue'
  import WebTerm from './webterm/index.vue'

  const router = useRoute()
  const id = router.query.id

  defineOptions({ name: 'DeviceDetail' })

  const deviceDetail = ref<any>({})

  const getDetail = async () => {
    const res = await DeviceService.getDevice(String(id))
    deviceDetail.value = res
  }

  onMounted(() => {
    getDetail()
  })

  const activeName = ref('monitor')
  const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
  }

  // 获取标签类型
  const getOnlineTagType = (ok: boolean) => {
    if (ok) {
      return 'success'
    }
    return 'danger'
  }

  // 构建标签文本
  const buildOnlineTagText = (ok: boolean) => {
    let text = '离线'
    if (ok) {
      text = '在线'
    }
    return text
  }
</script>

<style lang="scss">
  .device-detail-card {
    width: 100%;
    cursor: pointer;

    .art-custom-card {
      border-radius: calc(var(--custom-radius) + 2px) !important;
    }

    .content {
      padding: 16px;
      .category {
        margin-left: 20px;
        display: inline-block;
        padding: 2px 8px;
        margin-bottom: 8px;
        font-size: 12px;
        background: var(--art-gray-200);
        border-radius: 4px;
      }

      .title {
        margin-bottom: 16px;
        font-size: 18px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--art-text-gray-900);
      }
    }
  }
  .device-manager-tabs {
    margin-top: 20px;
    width: 100%;
    cursor: pointer;

    .art-custom-card {
      border-radius: calc(var(--custom-radius) + 2px) !important;
    }
    .device-tabs {
      padding: 16px;
    }
  }

  .monitor-card {
    padding: 20px;
    background-color: var(--art-main-bg-color);
    border-radius: var(--custom-radius);

    .card-header {
      padding-bottom: 15px;

      span {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
</style>
