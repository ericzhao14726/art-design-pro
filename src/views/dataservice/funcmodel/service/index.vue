<template>
  <div class="func-model-form">
    <ElFormItem label="服务类型" prop="serviceType">
      <ElSelect v-model="model.serviceType">
        <!-- <ElOption label="只读" value="ReadOnly" />
        <ElOption label="读写" value="ReadWrite" /> -->
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="输入参数" prop="input">
      <div v-for="(item, index) in model.input" :key="index">
        <ElDivider />
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="item.name" />
        </ElFormItem>
        <ElFormItem label="Key" prop="key">
          <ElInput v-model="item.key" />
        </ElFormItem>
        <SpecFormItem
          v-model="model.input[index]"
          :data-types-options="dataTypesOptions"
          :disabled="disabled"
        />
        <ElFormItem>
          <ElButton
            v-if="!disabled"
            class="iconfont-sys"
            type="danger"
            @click="removeServiceItem(model.input, index)"
            >&#xe619;删除参数</ElButton
          >
        </ElFormItem>
      </div>
      <ElButton
        v-if="!disabled"
        class="iconfont-sys"
        type="primary"
        @click="addServiceItem(model.input)"
        >&#xe604;添加参数</ElButton
      >
    </ElFormItem>
    <ElFormItem label="输出参数" prop="output">
      <div v-for="(item, index) in model.output" :key="index">
        <ElDivider />
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="item.name" />
        </ElFormItem>
        <ElFormItem label="Key" prop="key">
          <ElInput v-model="item.key" />
        </ElFormItem>
        <SpecFormItem
          v-model="model.output[index]"
          :data-types-options="dataTypesOptions"
          :disabled="disabled"
        />
        <ElFormItem v-if="!disabled">
          <ElButton
            class="iconfont-sys"
            type="danger"
            @click="removeServiceItem(model.output, index)"
            >&#xe619;删除参数</ElButton
          >
        </ElFormItem>
      </div>
      <ElButton
        v-if="!disabled"
        class="iconfont-sys"
        type="primary"
        @click="addServiceItem(model.output)"
        >&#xe604;添加参数</ElButton
      >
    </ElFormItem>
  </div>
</template>
<script setup lang="ts">
  import SpecFormItem from '../dataspec/index.vue'
  defineOptions({ name: 'ServiceFormItem' })

  interface Model {
    serviceType: string
    dataType: string
    input: Api.DataService.FuncModelDataType[]
    output: Api.DataService.FuncModelDataType[]
  }
  const model = defineModel<Model>({
    required: true
  })

  interface Props {
    dataTypesOptions: string[]
    disabled?: boolean
  }
  defineProps<Props>()
  const emptySpec = {
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
  }
  const emptyFuncModelDataType = <Api.DataService.FuncModelDataType>{
    name: '',
    key: '',
    dataType: '',
    spec: Object.assign({}, emptySpec)
  }

  const addServiceItem = (items: Api.DataService.FuncModelDataType[]) => {
    items.push(Object.assign({}, emptyFuncModelDataType))
  }
  const removeServiceItem = (items: Api.DataService.FuncModelDataType[], index: number) => {
    items.splice(index, 1)
  }
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
  .el-form-item .el-form-item {
    margin-bottom: 18px;
  }
</style>
