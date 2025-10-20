<template>
  <ElCard shadow="never" class="art-search-card">
    <ElForm :model="searchForm" inline>
      <ElFormItem label="产品名称">
        <ElInput
          v-model="searchForm.name"
          placeholder="请输入产品名称"
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
  defineOptions({ name: 'ProductSearch' })

  const props = defineProps<{
    modelValue: {
      name: string
    }
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: { name: string }]
    search: [params: { name: string }]
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
    searchForm.value = { name: '' }
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .art-search-card {
    margin-bottom: 16px;
  }
</style>