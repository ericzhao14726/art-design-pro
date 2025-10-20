<template>
  <ElCard shadow="never" class="art-search-card">
    <ElForm :model="searchForm" inline>
      <ElFormItem label="设备名称">
        <ElInput
          v-model="searchForm.name"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </ElFormItem>
      <ElFormItem label="产品ID">
        <ElInput
          v-model="searchForm.productId"
          placeholder="请输入产品ID"
          clearable
          @keyup.enter="handleSearch"
        />
      </ElFormItem>
      <ElFormItem>
        <ElButton type="primary" @click="handleSearch">查询</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </ElFormItem>
    </ElForm>
  </ElCard>
</template>

<script setup lang="ts">
  defineOptions({ name: 'DeviceSearch' })

  const props = defineProps<{
    modelValue: {
      name: string
      productId: string
    }
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: { name: string; productId: string }]
    search: [params: { name: string; productId: string }]
    reset: []
  }>()

  const searchForm = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleSearch = () => {
    emit('search', { ...searchForm.value })
  }

  const handleReset = () => {
    searchForm.value = { name: '', productId: '' }
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .art-search-card {
    margin-bottom: 16px;
  }
</style>