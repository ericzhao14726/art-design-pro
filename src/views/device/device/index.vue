<template>
  <div class="device-page art-full-height">
    <!-- 搜索栏 -->
    <DeviceSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></DeviceSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增设备</ElButton>
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

      <!-- 设备弹窗 -->
      <DeviceDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :device-data="currentDeviceData"
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
  import { useWindowSize } from '@vueuse/core'
  import { router } from '@/router'
  import DeviceSearch from './modules/device-search.vue'
  import DeviceDialog from './modules/device-dialog.vue'

  const { width } = useWindowSize()

  defineOptions({ name: 'Device' })

  // 弹窗相关
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentDeviceData = ref<Partial<any>>({})

  // 选中行
  const selectedRows = ref<any[]>([])

  // 搜索表单
  const searchForm = ref({
    name: '',
    productId: ''
  })

  // API 请求函数适配器
  const fetchDeviceList = async (params: any) => {
    const response = await DeviceService.getDevices({
      name: params.name || '',
      pageNo: params.current || 1,
      perPage: params.size || 10,
      productId: params.productId || ''
    })
    
    return {
      records: response.devices || [],
      current: response.pageResult.currentPageNo,
      size: params.size || 10,
      total: response.pageResult.totalCount
    }
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
      apiFn: fetchDeviceList,
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
            return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
              h('div', {}, [
                h('p', { class: 'device-name' }, row.name),
                h('p', { class: 'email' }, row.deviceId)
              ])
            ])
          }
        },
        {
          prop: 'productId-name',
          label: '所属产品',
          minWidth: width.value < 500 ? 220 : '',
          formatter: (row: any) => {
            return h('p', {}, '' + row.productName + '（' + row.productId + '）')
          }
        },
        {
          prop: 'isOnline',
          label: '在线状态',
          formatter: (row) => {
            return h('div', {}, [
              h(ElTag, { type: getOnlineTagType(row.isOnline) }, () =>
                buildOnlineTagText(row.isOnline)
              ),
            ])
          }
        },
        {
          prop: 'lastOnlineTime',
          label: '最后在线时间',
          formatter: (row: any) => {
            return h('p', {}, row.lastOnlineTime ? timestampToTime(row.lastOnlineTime, false) : '-')
          },
          sortable: true
        },
        {
          prop: 'ip',
          label: 'IP地址',
          formatter: (row: any) => {
            return h('p', {}, row.ip || '-')
          }
        },
        {
          prop: 'enable',
          label: '启用状态',
          formatter: (row: any) => {
            return h(ElSwitch, {
              modelValue: row.enable,
              onclick: () => updateToEnable(row.deviceId, !row.enable)
            })
          }
        },
        {
          prop: 'createdAt',
          label: '创建信息',
          formatter: (row: any) => {
            return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
              h('div', {}, [h('p', row.creator), h('p', timestampToTime(row.createdAt, false))])
            ])
          },
          sortable: true
        },
        {
          prop: 'updatedAt',
          label: '更新信息',
          formatter: (row: any) => {
            return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
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
                onClick: () => toDetail(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteDevice(row.deviceId)
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
   * 跳转到设备详情
   */
  const toDetail = (device: any) => {
    router.push({
      path: '/device/device/detail',
      query: {
        id: device.deviceId,
        name: device.name
      }
    })
  }

  /**
   * 显示设备弹窗
   */
  const showDialog = (type: 'add' | 'edit', row?: any): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentDeviceData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除设备
   */
  const deleteDevice = (row: any): void => {
    console.log('删除设备:', row)
    ElMessageBox.confirm(`确定要删除该设备吗？`, '删除设备', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      DeviceService.deleteDevice([row.deviceId])
        .then(() => {
          refreshData()
          ElMessage.success('删除成功')
        })
        .catch((error) => {
          console.error('删除设备失败:', error)
          ElMessage.error('删除设备失败')
        })
    })
  }

  /**
   * 更新设备启用状态
   */
  const updateToEnable = (deviceId: string, enabled: boolean) => {
    DeviceService.updateDeviceStatus({
      deviceId: deviceId,
      toEnable: enabled
    })
      .then(() => {
        refreshData()
      })
      .catch((error) => {
        console.error('更新设备状态失败:', error)
        ElMessage.error('更新设备状态失败')
      })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentDeviceData.value = {}
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
  .device-page {
    :deep(.device) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        .device-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }
</style>
