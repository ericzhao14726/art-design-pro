<template>
  <ArtTableFullScreen>
    <div class="model-page" id="table-full-screen">
      <!-- 搜索栏 -->
      <ArtSearchBar v-model:filter="formFilters" :items="formItems" @reset="handleReset" @search="handleSearch">
      </ArtSearchBar>

      <ElCard shadow="never" class="art-table-card">
        <!-- 表格头部 -->
        <ArtTableHeader v-model:columns="columnChecks" @refresh="handleRefresh">
          <template #left>
            <ElButton @click="showDialog('add')">新增</ElButton>
          </template>
        </ArtTableHeader>

        <!-- 表格 -->
        <ArtTable ref="tableRef" row-key="id" :loading="loading" :data="tableData" :currentPage="pagination.currentPage"
          :pageSize="pagination.pageSize" :total="pagination.total" :marginTop="10"
          @selection-change="handleSelectionChange" @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
          <template #default>
            <ElTableColumn v-for="col in columns" :key="col.prop || col.type" v-bind="col" />
          </template>
        </ArtTable>

        <ElDialog v-model="dialogVisible" :title="dialogTitle" width="55%" align-center>
          <ElForm class="func-model-form" ref="formRef" :model="formData" :rules="rules" :inline="true"
            :disabled="formDisabled" label-width="90px">
            <ElFormItem label="功能类型" prop="type">
              <ElSelect v-model="formData.type" @change="handlerTypeChange">
                <ElOption label="属性" value="Property" />
                <ElOption label="事件" value="Event" />
                <ElOption label="服务" value="Service" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="名称" prop="name">
              <ElInput v-model="formData.name" />
            </ElFormItem>
            <ElFormItem label="Key" prop="key">
              <ElInput v-model="formData.key" />
            </ElFormItem>
            <ElFormItem label="描述" prop="description">
              <ElInput v-model="formData.description" />
            </ElFormItem>
            <ElDivider v-if="formData.type" />
            <PropertyFormItem v-if="formData.type === 'Property'" v-model="formData"
              :data-types-options="dataTypeOptions" :disabled="formDisabled" />
            <EventFormItem v-if="formData.type === 'Event'" v-model="formData" :data-types-options="dataTypeOptions"
              :disabled="formDisabled" />
            <ServiceFormItem v-if="formData.type === 'Service'" v-model="formData" :data-types-options="dataTypeOptions"
              :disabled="formDisabled" />
          </ElForm>
          <template #footer>
            <div class="dialog-footer">
              <ElButton @click="dialogVisible = false">取消</ElButton>
              <ElButton v-if="!formDisabled" type="primary" @click="handleSubmit">提交</ElButton>
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
import { timestampToTime } from '@/utils/dataprocess/format'
import { useWindowSize } from '@vueuse/core'
import { defineOptions } from 'vue'
import { DeviceService } from '@/api/deviceApi'
import PropertyFormItem from './property/index.vue'
import EventFormItem from './event/index.vue'
import ServiceFormItem from './service/index.vue'

const { width } = useWindowSize()

defineOptions({ name: 'ProductFuncModelManager' })

// 接收产品ID作为props
const props = defineProps<{
  productId: string
}>()

const dialogType = ref('add')
const dialogTitle = ref('')
const formDisabled = ref(false)
const dialogVisible = ref(false)
const loading = ref(false)

// 定义表单搜索初始值
const initialSearchState = {
  name: '',
  modelType: ''
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
  getFuncModelList()
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索参数:', formFilters)
  pagination.currentPage = 1 // 搜索时重置到第一页
  getFuncModelList()
}

// 表单项变更处理
const handleFormChange = (params: SearchChangeParams): void => {
  console.log('表单项变更:', params)
}

// 表单配置项
const formItems: SearchFormItem[] = [
  {
    label: '名称',
    prop: 'name',
    type: 'input',
    config: {
      clearable: true
    },
    onChange: handleFormChange
  },
  {
    label: '类型',
    prop: 'modelType',
    type: 'select',
    config: {
      clearable: true
    },
    options: () => [
      { label: '属性', value: 'Property' },
      { label: '事件', value: 'Event' },
      { label: '服务', value: 'Service' }
    ],
    onChange: handleFormChange
  }
]

const dataTypeOptions = ref(['text', 'number', 'bool', 'enum', 'array', 'object'])

// 获取标签类型
const getModelTypeTagType = (t: string) => {
  switch (t) {
    case 'Property':
      return 'primary'
    case 'Event':
      return 'warning'
    case 'Service':
      return 'success'
    default:
      return 'info'
  }
}

// 构建标签文本
const buildModelTypeText = (t: string) => {
  let text = '-'
  if (t === 'Property') {
    text = '属性'
  } else if (t === 'Event') {
    text = '事件'
  } else if (t === 'Service') {
    text = '服务'
  }
  return text
}

// 显示对话框
const showDialog = (type: string, row?: any) => {
  dialogVisible.value = true
  dialogType.value = type
  formDisabled.value = false
  // 重置表单验证状态
  if (formRef.value) {
    formRef.value.resetFields()
    resetFormData() // 重置表单数据
  }
  if (type === 'edit' && row) {
    dialogTitle.value = '编辑功能模型'
    Object.assign(formData, { ...row }) // 复制对象，避免引用导致表单数据不一致
  } else if (type === 'detail' && row) {
    dialogTitle.value = '功能模型详情'
    formDisabled.value = true
    Object.assign(formData, { ...row }) // 复制对象，避免引用导致表单数据不一致
  } else {
    dialogTitle.value = '新增功能模型'
    resetFormData() // 重置表单数据
    formData.type = 'Property' // 默认类型为属性
  }
}

// 删除功能模型
const deleteFuncModel = (modelId: string) => {
  ElMessageBox.confirm('确定要删除该功能模型吗？', '删除功能模型', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    DeviceService.deleteFuncModel([modelId])
      .then(() => {
        getFuncModelList()
        ElMessage.success('删除成功')
      })
      .catch((error) => {
        console.error('删除功能模型失败:', error)
        ElMessage.error('删除功能模型失败')
      })
  })
}

const copy = (text: string) => {
  if (!text) return

  let copyipt = document.createElement('input')
  copyipt.setAttribute('value', text ? text : '')
  document.body.appendChild(copyipt)
  copyipt.select()
  document.execCommand('copy')
  document.body.removeChild(copyipt)

  ElMessage.success(`已复制`)
}

// 动态列配置
const { columnChecks, columns } = useCheckedColumns(() => [
  {
    prop: 'id-name',
    label: '名称/ID',
    minWidth: width.value < 500 ? 220 : '',
    formatter: (row: any) => {
      return h('div', { class: 'func-model', style: 'display: flex; align-items: center' }, [
        h('div', {}, [
          h('p', { class: 'model-name' }, row.name),
          h('p', { class: 'email' }, row.funcModelId)
        ])
      ])
    }
  },
  {
    prop: 'key',
    label: 'Key',
    minWidth: width.value < 500 ? 220 : '',
    formatter: (row: any) => {
      return h('div', { class: 'func-model', style: 'display: flex; align-items: center' }, [
        h('div', {}, [
          h('span', { class: 'model-key' }, row.key),
          h(ArtButtonTable, {
            onClick: () => copy(row.key),
            icon: '&#xe624;',
            buttonBgColor: 'transparent'
          })
        ])
      ])
    }
  },
  {
    prop: 'type',
    label: '类型',
    minWidth: width.value < 500 ? 220 : '',
    formatter: (row: any) => {
      return h(ElTag, { type: getModelTypeTagType(row.type) }, () => buildModelTypeText(row.type))
    }
  },
  {
    prop: 'data-type',
    label: '数据类型',
    minWidth: width.value < 500 ? 220 : '',
    formatter: (row: any) => {
      return h('div', { class: 'func-model', style: 'display: flex; align-items: center' }, [
        h(
          'p',
          {},
          (function () {
            switch (row.type) {
              case 'Property':
                return row.dataType
              case 'Event':
                return row.output
                  .map((item: any) => {
                    return item.dataType
                  })
                  .join(',')
              case 'Service':
                return (
                  row.input
                    .map((item: any) => {
                      return item.dataType
                    })
                    .join(',') +
                  ' -> ' +
                  row.output
                    .map((item: any) => {
                      return item.dataType
                    })
                    .join(',')
                )
              default:
                return '-'
            }
          })()
        )
      ])
    }
  },
  {
    prop: 'createdAt',
    label: '创建',
    formatter: (row: any) => {
      return h('div', { class: 'func-model', style: 'display: flex; align-items: center' }, [
        h('div', {}, [h('p', row.creator), h('p', timestampToTime(row.createdAt, false))])
      ])
    },
    sortable: true
  },
  {
    prop: 'updatedAt',
    label: '更新',
    formatter: (row: any) => {
      return h('div', { class: 'func-model', style: 'display: flex; align-items: center' }, [
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
          type: 'edit',
          onClick: () => showDialog('edit', row)
        }),
        h(ArtButtonTable, {
          type: 'delete',
          onClick: () => deleteFuncModel(row.funcModelId)
        }),
        h(ArtButtonTable, {
          type: 'detail',
          onClick: () => showDialog('detail', row)
        })
      ])
    }
  }
])

// 表单实例
const formRef = ref<FormInstance>()

const initFormData = {
  funcModelId: '',
  type: '',
  createdAt: 0,
  updatedAt: 0,
  creator: '',
  editor: '',
  name: '',
  key: '',
  description: '',
  input: [],
  output: [],
  dataType: '',
  spec: {
    max: 0,
    min: 0,
    step: 0,
    unit: '',
    len: 0,
    dataType: '',
    bool: {
      trueValue: '',
      falseValue: ''
    },
    enum: []
  },
  propertyType: '',
  eventType: '',
  serviceType: ''
}

// 表单数据
const formData = reactive<Api.DataService.FuncModel>({ ...initFormData })

const resetFormData = () => {
  initFormData.input = []
  initFormData.output = []
  Object.assign(formData, { ...initFormData })
}

const handlerTypeChange = () => {
  // 保留部分数据
  let name = formData.name
  let key = formData.key
  let type = formData.type
  let desc = formData.description
  // 重置表单数据
  initFormData.input = []
  initFormData.output = []
  Object.assign(formData, { ...initFormData })
  formData.name = name
  formData.key = key
  formData.type = type
  formData.description = desc

  console.log(initFormData, formData)
}

// 获取功能模型列表数据
const getFuncModelList = async () => {
  loading.value = true
  try {
    const { currentPage, pageSize } = pagination

    const getFuncModelsResp = await DeviceService.getFuncModels({
      pageNo: currentPage,
      perPage: pageSize,
      productId: props.productId, // 根据产品ID过滤功能模型
      modelIds: [],
      name: formFilters.name,
      modelType: formFilters.modelType
    })
    tableData.value = getFuncModelsResp.funcModels == null ? [] : getFuncModelsResp.funcModels
    const pageRes = getFuncModelsResp.pageResult
    // 更新分页信息
    Object.assign(pagination, {
      currentPage: pageRes.currentPageNo,
      pageSize: pageSize,
      total: pageRes.totalCount
    })
  } catch (error) {
    console.error('获取功能模型列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  getFuncModelList()
}

// 处理表格行选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 表单验证规则
const rules = reactive<FormRules>({
  type: [{ required: true, message: '请选择功能类型', trigger: 'blur' }],
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  key: [
    { required: true, message: '请输入Key', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字、下划线', trigger: 'blur' }
  ]
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        createFuncmodel()
      } else {
        updateFuncModel()
      }
    }
  })
}

const createFuncmodel = () => {
  // 添加产品ID到创建请求中
  const createParams = {
    ...formData,
    productId: props.productId
  }

  DeviceService.createFuncModel(createParams)
    .then(() => {
      getFuncModelList()
      ElMessage.success('添加成功')
      dialogVisible.value = false
    })
    .catch((error) => {
      console.error('添加功能模型失败:', error)
      ElMessage.error('添加功能模型失败')
    })
}

const updateFuncModel = () => {
  console.log('to update', formData)
  DeviceService.updateFuncModel({ ...formData, _: 1 })
    .then(() => {
      getFuncModelList()
      ElMessage.success('更新成功')
      dialogVisible.value = false
    })
    .catch((error) => {
      console.error('更新功能模型失败:', error)
      ElMessage.error('更新功能模型失败')
    })
}

// 处理表格分页变化
const handleSizeChange = (newPageSize: number) => {
  pagination.pageSize = newPageSize
  getFuncModelList()
}

const handleCurrentChange = (newCurrentPage: number) => {
  pagination.currentPage = newCurrentPage
  getFuncModelList()
}

onMounted(() => {
  getFuncModelList()
})
</script>

<style lang="scss" scoped>
.model-page {
  :deep(.device) {
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    >div {
      .model-name {
        font-weight: 500;
        color: var(--art-text-gray-800);
      }

      .model-key {
        color: var(--art-text-gray-800);
        font-style: italic;
      }
    }
  }
}

.func-model-form {
  .el-input {
    --el-input-width: 300px;
  }

  .el-select {
    --el-select-width: 300px;
  }
}
</style>