<template>
  <ArtTableFullScreen>
    <div class="device-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar
        v-model:filter="formFilters"
        :items="formItems"
        @reset="handleReset"
        @search="handleSearch"
      >
      </ArtSearchBar>

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
            <ElFormItem label="产品" prop="productId">
              <ElSelect
                v-model="formData.productId"
                :filterable="true"
                :remote="true"
                :remote-method="getProductOptions"
                placeholder="检索产品"
              >
                <ElOption
                  v-for="item in productSelectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
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

  import { ElDialog, FormInstance, ElTag } from 'element-plus'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import type { FormRules } from 'element-plus'
  import { useCheckedColumns } from '@/composables/useCheckedColumns'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { SearchChangeParams, SearchFormItem } from '@/types'
  import { DeviceService } from '@/api/deviceApi'
  import { timestampToTime } from '@/utils/dataprocess/format'
  import { useWindowSize } from '@vueuse/core'
  import { defineOptions } from 'vue'
  import { router } from '@/router'
  import { RoutesAlias } from '@/router/routesAlias'

  const { width } = useWindowSize()

  defineOptions({ name: 'Device' }) // 定义组件名称，用于 KeepAlive 缓存控制

  const dialogType = ref('add')
  const dialogVisible = ref(false)
  const loading = ref(false)

  // 定义表单搜索初始值
  const initialSearchState = {
    name: '',
    productId: ''
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

  const productSelectOptions = ref<any>([])

  const getProductOptions = (q: string) => {
    DeviceService.getProducts({
      name: q,
      pageNo: 1,
      perPage: 10
    }).then((res) => {
      productSelectOptions.value = res.products.map((product: any) => {
        return {
          value: product.productId,
          label: product.name + '（' + product.productId + '）'
        }
      })
    })
  }

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
      formData.productId = row.productId
      getProductOptions(row.productName) // 获取产品列表
    } else {
      getProductOptions('') // 获取产品列表
      formData.deviceId = ''
      formData.productId = ''
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
        })
        .catch((error) => {
          console.error('删除设备失败:', error)
        })
      ElMessage.success('删除成功')
    })
  }

  // 动态列配置
  const { columnChecks, columns } = useCheckedColumns(() => [
    // { type: 'selection' }, // 勾选列
    // { type: 'expand', label: '展开', width: 80 }, // 展开列
    // { type: 'index', label: '序号', width: 80 }, // 序号列
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
      label: '是否在线',
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
      label: '是否启用',
      formatter: (row: any) => {
        return h(ElSwitch, {
          modelValue: row.enable,
          onclick: () => updateToEnable(row.deviceId, !row.enable)
        })
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
      // fixed: 'right', // 固定在右侧
      // disabled: true,
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
  ])

  const toDetail = (device: any) => {
    router.push({
      path: RoutesAlias.DeviceDetail,
      query: {
        id: device.deviceId,
        name: device.name
      }
    })
  }

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    productId: '',
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
        name: formFilters.name,
        pageNo: currentPage,
        perPage: pageSize,
        productId: ''
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

  const updateToEnable = (productId: string, enabled: boolean) => {
    DeviceService.updateDeviceStatus({
      deviceId: productId,
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

  const handleRefresh = () => {
    getDeviceList()
  }

  // 处理表格行选择变化
  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  // 表单验证规则
  const rules = reactive<FormRules>({
    productId: [{ required: true, message: '请选择产品', trigger: 'blur' }],
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
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        dialogVisible.value = false
      }
    })
  }
  const createDevice = () => {
    DeviceService.createDevice({
      name: formData.name,
      description: formData.description,
      productId: formData.productId
    })
      .then(() => {
        getDeviceList()
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
      })
      .catch((error) => {
        console.error('更新设备失败:', error)
        ElMessage.error('更新设备失败')
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
