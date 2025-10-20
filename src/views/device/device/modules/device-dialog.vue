<template>
  <ElDialog
    v-model="visible"
    :title="type === 'add' ? '添加设备' : '编辑设备'"
    width="500px"
    align-center
    destroy-on-close
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="产品" prop="productId">
        <ElSelect
          v-model="formData.productId"
          :filterable="true"
          :remote="true"
          :remote-method="getProductOptions"
          placeholder="检索产品"
          style="width: 100%"
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
        <ElInput v-model="formData.name" placeholder="请输入设备名称" />
      </ElFormItem>
      <ElFormItem label="设备描述" prop="description">
        <ElInput
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入设备描述"
        />
      </ElFormItem>
    </ElForm>
    
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="loading">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElForm, ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { DeviceService } from '@/api/deviceApi'

  defineOptions({ name: 'DeviceDialog' })

  const props = defineProps<{
    visible: boolean
    type: 'add' | 'edit'
    deviceData: Partial<any>
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: []
  }>()

  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const formRef = ref<FormInstance>()
  const loading = ref(false)
  const productSelectOptions = ref<any[]>([])

  const formData = reactive({
    productId: '',
    deviceId: '',
    name: '',
    description: ''
  })

  const rules = reactive<FormRules>({
    productId: [{ required: true, message: '请选择产品', trigger: 'change' }],
    name: [
      { required: true, message: '请输入设备名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  })

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

  watch(
    () => props.deviceData,
    (newData) => {
      if (newData) {
        Object.assign(formData, {
          productId: newData.productId || '',
          deviceId: newData.deviceId || '',
          name: newData.name || '',
          description: newData.description || ''
        })
        if (newData.productId) {
          getProductOptions(newData.productName || '')
        }
      }
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      if (props.type === 'add') {
        await DeviceService.createDevice({
          name: formData.name,
          description: formData.description,
          productId: formData.productId
        })
        ElMessage.success('添加成功')
      } else {
        await DeviceService.updateDevice({
          deviceId: formData.deviceId,
          name: formData.name,
          description: formData.description
        })
        ElMessage.success('更新成功')
      }

      emit('submit')
      handleCancel()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error(props.type === 'add' ? '添加失败' : '更新失败')
    } finally {
      loading.value = false
    }
  }

  const handleCancel = () => {
    visible.value = false
    if (formRef.value) {
      formRef.value.resetFields()
    }
  }
</script>

<style lang="scss" scoped>
  .dialog-footer {
    text-align: right;
  }
</style>