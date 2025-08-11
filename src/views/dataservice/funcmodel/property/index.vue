<template>
  <div class="func-model-form">
    <ElFormItem label="属性类型" prop="propertyType">
      <ElSelect v-model="formData.propertyType">
        <ElOption label="只读" value="ReadOnly" />
        <ElOption label="读写" value="ReadWrite" />
      </ElSelect>
    </ElFormItem>
    <SpecFormItem v-model="formData" :data-types-options="dataTypesOptions" :disabled="disabled" />
  </div>
</template>
<script setup lang="ts">
  import SpecFormItem from '../dataspec/index.vue'
  defineOptions({ name: 'PropertyFormItem' })

  interface Model {
    propertyType: string
    dataType: string
    spec: Api.DataService.DataSpec
  }
  const formData = defineModel<Model>({
    required: true
  })

  interface Props {
    dataTypesOptions: string[]
    disabled?: boolean
  }
  defineProps<Props>()
</script>
<style>
  .func-model-form {
    .el-input {
      --el-input-width: 300px;
    }
    .el-select {
      --el-select-width: 300px;
    }
  }
</style>
