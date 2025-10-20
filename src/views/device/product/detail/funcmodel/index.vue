<template>
  <div class="model-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar v-model:filter="searchForm" :items="formItems" @reset="resetSearchParams" @search="handleSearch">
    </ArtSearchBar>

    <ElCard shadow="never" class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton @click="showDialog('add')">新增</ElButton>
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
</template>

<script setup lang="ts">
import { h } from 'vue'
import { ElDialog, FormInstance, ElTag } from 'element-plus'
import { ElMessageBox, ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'
import { useTable } from '@/composables/useTable'
import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
import { SearchChangeParams, SearchFormItem } from '@/types'
import { timestampToTime } from '@/utils/dataprocess/format'
import { useWindowSize } from '@vueuse/core'
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

// 选中的行数据
const selectedRows = ref<any[]>([])

// 搜索表单
const searchForm = ref({
  name: '',
  modelType: ''
})

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

// API 请求函数适配器
const fetchFuncModelList = async (params: any) => {
  const response = await DeviceService.getFuncModels({
    pageNo: params.current || 1,
    perPage: params.size || 10,
    productId: props.productId,
    modelIds: [],
    name: params.name || '',
    modelType: params.modelType || ''
  })
  
  return {
    records: response.funcModels || [],
    current: response.pageResult.currentPageNo,
    size: params.size || 10,
    total: response.pageResult.totalCount
  }
}

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
    apiFn: fetchFuncModelList,
    apiParams: {
      current: 1,
      size: 10,
      ...searchForm.value
    },
    columnsFactory: () => [
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
    ]
  }
})

// 搜索处理
const handleSearch = () => {
  searchParams.value = { ...searchForm.value }
  getData()
}

// 显示对话框
const showDialog = (type: string, row?: any) => {
  dialogVisible.value = true
  dialogType.value = type
  formDisabled.value = false
  if (formRef.value) {
    formRef.value.resetFields()
    resetFormData()
  }
  if (type === 'edit' && row) {
    dialogTitle.value = '编辑功能模型'
    Object.assign(formData, { ...row })
  } else if (type === 'detail' && row) {
    dialogTitle.value = '功能模型详情'
    formDisabled.value = true
    Object.assign(formData, { ...row })
  } else {
    dialogTitle.value = '新增功能模型'
    resetFormData()
    formData.type = 'Property'
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
        refreshData()
        ElMessage.success('删除成功')
      })
      .catch((error) => {
        console.error('删除功能模型失败:', error)
        ElMessage.error('删除功能模型失败')
      })
  })
}

// 处理表格行选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

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
  let name = formData.name
  let key = formData.key
  let type = formData.type
  let desc = formData.description
  initFormData.input = []
  initFormData.output = []
  Object.assign(formData, { ...initFormData })
  formData.name = name
  formData.key = key
  formData.type = type
  formData.description = desc

  console.log(initFormData, formData)
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
  const createParams = {
    ...formData,
    productId: props.productId
  }

  DeviceService.createFuncModel(createParams)
    .then(() => {
      refreshData()
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
      refreshData()
      ElMessage.success('更新成功')
      dialogVisible.value = false
    })
    .catch((error) => {
      console.error('更新功能模型失败:', error)
      ElMessage.error('更新功能模型失败')
    })
}
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