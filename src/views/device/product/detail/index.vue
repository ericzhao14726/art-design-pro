<template>
  <div class="product-detail-card">
    <ElCard :body-style="{ padding: '0px' }" shadow="hover" class="art-custom-card">
      <div class="content">
        <div class="title">
          <span>{{ productDetail.name }}</span>
          <span class="category">
            {{ productDetail.productId }}
          </span>
          <ElTag style="margin-left: 10px" :type="getEnableTagType(productDetail.enable)">
            {{ buildEnableTagText(productDetail.enable) }}
          </ElTag>
        </div>
        <ElDescriptions direction="vertical">
          <ElDescriptionsItem label="创建">
            {{ productDetail.creator }} /
            {{ timestampToTime(productDetail.createdAt, false) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="修改">
            {{ productDetail.editor }} /
            {{ timestampToTime(productDetail.updatedAt, false) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="功能模型数量">
            {{ productDetail.funcModels ? productDetail.funcModels.length : 0 }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="描述">
            {{ productDetail.description || '-' }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
    </ElCard>
  </div>
  <div class="product-manager-tabs">
    <ElCard :body-style="{ padding: '0px' }" shadow="hover" class="art-custom-card">
      <el-tabs v-model="activeName" class="product-tabs" @tab-click="handleClick">
        <el-tab-pane label="功能模型" name="funcModel">
          <FuncModelManager
            v-if="productDetail.productId"
            :product-id="productDetail.productId"
          />
        </el-tab-pane>
        <el-tab-pane label="设备列表" name="devices">
          <ProductDevices
            v-if="productDetail.productId"
            :product-id="productDetail.productId"
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
  import FuncModelManager from './funcmodel/index.vue'
  import ProductDevices from './devices/index.vue'

  const router = useRoute()
  const id = router.query.id

  defineOptions({ name: 'ProductDetail' })

  const productDetail = ref<Api.Device.Product>({
    productId: '',
    name: '',
    description: '',
    enable: false,
    createdAt: 0,
    updatedAt: 0,
    creator: '',
    editor: '',
    funcModels: []
  })

  const getDetail = async () => {
    try {
      const res = await DeviceService.getProduct(String(id))
      productDetail.value = res
    } catch (error) {
      console.error('获取产品详情失败:', error)
    }
  }

  onMounted(() => {
    getDetail()
  })

  const activeName = ref('funcModel')
  const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
  }

  // 获取启用状态标签类型
  const getEnableTagType = (enable: boolean) => {
    if (enable) {
      return 'success'
    }
    return 'info'
  }

  // 构建启用状态标签文本
  const buildEnableTagText = (enable: boolean) => {
    return enable ? '启用' : '停用'
  }
</script>

<style lang="scss">
  .product-detail-card {
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
  .product-manager-tabs {
    margin-top: 20px;
    width: 100%;
    cursor: pointer;

    .art-custom-card {
      border-radius: calc(var(--custom-radius) + 2px) !important;
    }
    .product-tabs {
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