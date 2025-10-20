<template>
  <div class="product-page art-full-height">
    <!-- 搜索栏 -->
    <ProductSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></ProductSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增产品</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 产品弹窗 -->
      <ProductDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :product-data="currentProductData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, nextTick } from 'vue'
  import { ElTag, ElSwitch, ElMessageBox, ElMessage } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { DeviceService } from '@/api/deviceApi'
  import { timestampToTime } from '@/utils/dataprocess/format'
  import { useRouter } from 'vue-router'
  import { useWindowSize } from '@vueuse/core'
  import ProductSearch from './modules/product-search.vue'
  import ProductDialog from './modules/product-dialog.vue'

  const { width } = useWindowSize()

  defineOptions({ name: 'Product' })

  const router = useRouter()

  // 弹窗相关
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentProductData = ref<Partial<any>>({})

  // 选中行
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    name: ''
  })

  // API 请求函数适配器
  const fetchProductList = async (params: any) => {
    const response = await DeviceService.getProducts({
      name: params.name || '',
      pageNo: params.current || 1,
      perPage: params.size || 10
    })
    
    return {
      records: response.products || [],
      current: response.pageResult.currentPageNo,
      size: params.size || 10,
      total: response.pageResult.totalCount
    }
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchProductList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'id-name',
          label: '名称/ID',
          minWidth: width.value < 500 ? 220 : '',
          formatter: (row: any) => {
            return h('div', { class: 'product', style: 'display: flex; align-items: center' }, [
              h('div', {}, [
                h('p', { class: 'product-name' }, row.name),
                h('p', { class: 'email' }, row.productId)
              ])
            ])
          }
        },
        {
          prop: 'enable',
          label: '启用状态',
          formatter: (row: any) => {
            return h(ElSwitch, {
              modelValue: row.enable,
              onclick: () => updateToEnable(row.productId, !row.enable)
            })
          }
        },
        {
          prop: 'createdAt',
          label: '创建信息',
          formatter: (row: any) => {
            return h('div', { class: 'product', style: 'display: flex; align-items: center' }, [
              h('div', {}, [h('p', row.creator), h('p', timestampToTime(row.createdAt, false))])
            ])
          },
          sortable: true
        },
        {
          prop: 'updatedAt',
          label: '更新信息',
          formatter: (row: any) => {
            return h('div', { class: 'product', style: 'display: flex; align-items: center' }, [
              h('div', {}, [h('p', row.editor), h('p', timestampToTime(row.updatedAt, false))])
            ])
          },
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right', // 固定列
          formatter: (row: any) => {
            return h('div', [
              h(ArtButtonTable, {
                type: 'detail',
                onClick: () => goToProductDetail(row.productId)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteProduct(row.productId)
              })
            ])
          }
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log(params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 跳转到产品详情
   */
  const goToProductDetail = (productId: string) => {
    router.push({
      path: '/device/product/detail',
      query: {
        id: productId
      }
    })
  }

  /**
   * 显示产品弹窗
   */
  const showDialog = (type: 'add' | 'edit', row?: any): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentProductData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除产品
   */
  const deleteProduct = (row: any): void => {
    console.log('删除产品:', row)
    ElMessageBox.confirm(`确定要删除该产品吗？`, '删除产品', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      DeviceService.deleteProduct([row.productId])
        .then(() => {
          refreshData()
          ElMessage.success('删除成功')
        })
        .catch((error) => {
          console.error('删除产品失败:', error)
          ElMessage.error('删除产品失败')
        })
    })
  }

  /**
   * 更新产品启用状态
   */
  const updateToEnable = (productId: string, enabled: boolean) => {
    DeviceService.updateProductStatus({
      productId: productId,
      toEnable: enabled
    })
      .then(() => {
        refreshData()
      })
      .catch((error) => {
        console.error('更新产品状态失败:', error)
        ElMessage.error('更新产品状态失败')
      })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentProductData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: any[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .product-page {
    :deep(.product) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        .product-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
