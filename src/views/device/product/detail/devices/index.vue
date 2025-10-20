<template>
  <ArtTableFullScreen>
    <div class="device-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="formFilters"
        :items="formItems"
        @reset="handleReset"
        @search="handleSearch"
      ></ArtSearchBar>

      <ElCard shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" @refresh="handleRefresh">
          <template #left>
            <ElButton @click="showDialog('add')">新增设备</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable
          ref="tableRef"
          row-key="id"
          :loading="loading"
          :data="tableData"
          :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize"
          :total="pagination.total"
          :marginTop="10"
          @selection-change="handleSelectionChange"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
          <template #default>
            <ElTableColumn v-for="col in columns" :key="col.prop || col.type" v-bind="col" />
          </template>
        </ArtTable>

        <ElDialog
          v-model="dialogVisible"
          :title="dialogType === 'add' ? '添加设备' : '编辑设备'"
          width="30%"
          align-center
        >
          <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
            <ElFormItem label="设备名称" prop="name">
              <ElInput v-model="formData.name" />
            </ElFormItem>
            <ElFormItem label="描述" prop="description">
              <ElInput v-model="formData.description" />
            </ElFormItem>
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="dialogVisible = false">取消</ElButton>
              <ElButton type="primary" @click="handleSubmit">提交</ElButton>
            </div>
          </template>
        </ElDialog>
      </ElCard>
    </div>
  </ArtTableFullScreen>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElDialog, FormInstance, ElTag, ElSwitch } from 'element-plus'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { useTableColumns } from '@/composables/useTableColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { SearchChangeParams, SearchFormItem } from '@/types'
  import { DeviceService } from '@/api/deviceApi'
  import { timestampToTime } from '@/utils/dataprocess/format'
  import { useRouter } from 'vue-router'
  const { width } = useWindowSize()

  defineOptions({ name: 'ProductDevices' })

  // 接收产品ID作为props
  const props = defineProps<{
    productId: string
  }>()

  const router = useRouter()
  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)

  // 定义表单搜索初始值
  const initialSearchState = {
    name: ''
  }

  // 响应式表单数据
  const formFilters = reactive({ ...initialSearchState })

  const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
  })

  // 表格数据
  const tableData = ref<any[]>([])

  // 表格实例引用
  const tableRef = ref()

  // 选中的行数据
  const selectedRows = ref<any[]>([])

  // 重置表单
  const handleReset = () => {
    Object.assign(formFilters, { ...initialSearchState })
    pagination.currentPage = 1 // 重置到第一页
    getDeviceList()
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', formFilters)
    pagination.currentPage = 1 // 搜索时重置到第一页
    getDeviceList()
  }

  // 表单项变更处理
  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // 表单配置项
  const formItems: SearchFormItem[] = [
    {
      label: '设备名称',
      prop: 'name',
      type: 'input',
      config: {
        clearable: true
      },
      onChange: handleFormChange
    }
  ]

  // 显示对话框
  const showDialog = (type: string, row?: any) => {
    dialogVisible.value = true
    dialogType.value = type

    // 重置表单验证状态
    if (formRef.value) {
      formRef.value.resetFields()
    }

    if (type === 'edit' && row) {
      formData.deviceId = row.deviceId
      formData.name = row.name
      formData.description = row.description
    } else {
      formData.name = ''
      formData.description = ''
    }
  }

  // 删除设备
  const deleteDevice = (deviceId: string) => {
    ElMessageBox.confirm('确定要删除该设备吗？', '删除设备', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      DeviceService.deleteDevice([deviceId])
        .then(() => {
          getDeviceList()
          ElMessage.success('删除成功')
        })
        .catch((error) => {
          console.error('删除设备失败:', error)
          ElMessage.error('删除设备失败')
        })
    })
  }

  // 跳转到设备详情
  const goToDeviceDetail = (deviceId: string) => {
    router.push({
      path: '/device/device/detail',
      query: { id: deviceId }
    })
  }

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
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
      prop: 'isOnline',
      label: '在线状态',
      formatter: (row: any) => {
        return h(ElTag, { type: row.isOnline ? 'success' : 'danger' }, () => 
          row.isOnline ? '在线' : '离线'
        )
      }
    },
    {
      prop: 'enable',
      label: '启用',
      formatter: (row: any) => {
        return h(ElSwitch, {
          modelValue: row.enable,
          onclick: () => updateToEnable(row.deviceId, !row.enable)
        })
      }
    },
    {
      prop: 'lastOnlineTime',
      label: '最后在线时间',
      formatter: (row: any) => {
        return row.lastOnlineTime ? timestampToTime(row.lastOnlineTime, false) : '-'
      }
    },
    {
      prop: 'createdAt',
      label: '创建',
      formatter: (row: any) => {
        return h('div', { class: 'device', style: 'display: flex; align-items: center' }, [
          h('div', {}, [h('p', row.creator), h('p', timestampToTime(row.createdAt, false))])
        ])
      },
      sortable: true
    },
    {
      prop: 'updatedAt',
      label: '更新',
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
      formatter: (row: any) => {
        return h('div', [
          h(ArtButtonTable, {
            type: 'detail',
            onClick: () => goToDeviceDetail(row.deviceId)
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
  ])

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    deviceId: '',
    name: '',
    description: ''
  })

  onMounted(() => {
    getDeviceList()
  })

  // 获取设备列表数据
  const getDeviceList = async () => {
    loading.value = true
    try {
      const { currentPage, pageSize } = pagination

      const getDevicesResp = await DeviceService.getDevices({
        productId: props.productId, // 使用产品ID过滤设备
        name: formFilters.name,
        pageNo: currentPage,
        perPage: pageSize
      })
      tableData.value = getDevicesResp.devices == null ? [] : getDevicesResp.devices
      const pageRes = getDevicesResp.pageResult
      // 更新分页信息
      Object.assign(pagination, {
        currentPage: pageRes.currentPageNo,
        pageSize: pageSize,
        total: pageRes.totalCount
      })
    } catch (error) {
      console.error('获取设备列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleRefresh = () => {
    getDeviceList()
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
    name: [
      { required: true, message: '请输入设备名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ]
  })

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        if (dialogType.value === 'add') {
          createDevice()
        } else {
          updateDevice()
        }
      }
    })
  }

  const createDevice = () => {
    DeviceService.createDevice({
      productId: props.productId, // 关联到当前产品
      name: formData.name,
      description: formData.description
    })
      .then(() => {
        getDeviceList()
        ElMessage.success('添加成功')
        dialogVisible.value = false
      })
      .catch((error) => {
        console.error('添加设备失败:', error)
        ElMessage.error('添加设备失败')
      })
  }

  const updateDevice = () => {
    console.log('to update', formData)
    DeviceService.updateDevice({
      deviceId: formData.deviceId,
      name: formData.name,
      description: formData.description
    })
      .then(() => {
        getDeviceList()
        ElMessage.success('更新成功')
        dialogVisible.value = false
      })
      .catch((error) => {
        console.error('更新设备失败:', error)
        ElMessage.error('更新设备失败')
      })
  }

  const updateToEnable = (deviceId: string, enabled: boolean) => {
    DeviceService.updateDeviceStatus({
      deviceId: deviceId,
      toEnable: enabled
    })
      .then(() => {
        getDeviceList()
      })
      .catch((error) => {
        console.error('更新设备状态失败:', error)
        ElMessage.error('更新设备状态失败')
      })
  }

  // 处理表格分页变化
  const handleSizeChange = (newPageSize: number) => {
    pagination.pageSize = newPageSize
    getDeviceList()
  }

  const handleCurrentChange = (newCurrentPage: number) => {
    pagination.currentPage = newCurrentPage
    getDeviceList()
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