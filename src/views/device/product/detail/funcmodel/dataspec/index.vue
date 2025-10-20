<template>
  <div v-if="model.spec" class="func-model-form">
    <ElFormItem label="数据类型" prop="dataType">
      <ElSelect v-model="model.dataType" @change="handleDateTypeSelected()">
        <ElOption v-for="item in dataTypesOptions" :label="item" :value="item" :key="item" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem v-if="maxSpecOf.includes(model.dataType)" label="最大值">
      <ElInputNumber v-model="model.spec.max" :precision="2" :step="1" />
    </ElFormItem>
    <ElFormItem v-if="minSpecOf.includes(model.dataType)" label="最小值">
      <ElInputNumber v-model="model.spec.min" :precision="2" :step="1" />
    </ElFormItem>
    <ElFormItem v-if="stepSpecOf.includes(model.dataType)" label="步长">
      <ElInputNumber v-model="model.spec.step" :step="1" />
    </ElFormItem>
    <ElFormItem v-if="unitSpecOf.includes(model.dataType)" label="单位">
      <ElInput v-model="model.spec.unit" autocomplete="off" />
    </ElFormItem>
    <ElFormItem v-if="lenSpecOf.includes(model.dataType)" label="长度">
      <ElInputNumber v-model="model.spec.len" :step="1" />
    </ElFormItem>
    <ElFormItem v-if="boolSpecOf.includes(model.dataType) && model.spec.bool" label="含义">
      <div class="form-item-item">
        <ElFormItem>
          <ElInput v-model="model.spec.bool.trueValue">
            <template #prepend> True </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem>
          <ElInput v-model="model.spec.bool.falseValue">
            <template #prepend>False</template>
          </ElInput>
        </ElFormItem>
      </div>
    </ElFormItem>
    <ElFormItem v-if="enumSpecOf.includes(model.dataType)" label="含义" class="center">
      <ElFormItem class="form-item-item" v-for="(item, index) in model.spec.enum" :key="index">
        <ElFormItem>
          <ElInput v-model="item.name">
            <template #prepend>枚举名称</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem>
          <ElInput v-model="item.mean">
            <template #prepend>枚举含义</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem>
          <el-button
            v-if="!disabled"
            class="iconfont-sys"
            type="danger"
            @click="removeEnum(model.spec.enum, index)"
            >&#xe619;</el-button
          >
        </ElFormItem>
      </ElFormItem>
      <ElFormItem v-if="model.spec.enum && !disabled">
        <el-button class="iconfont-sys" type="primary" @click="addEnum(model.spec.enum)"
          >&#xe604;</el-button
        >
      </ElFormItem>
    </ElFormItem>
    <div class="form-item-sub">
      <ElDivider v-if="dataTypeSpecOf.includes(model.dataType)" />
      <ElFormItem v-if="dataTypeSpecOf.includes(model.dataType)" label="子数据类型">
        <SpecFormItem
          v-model="model.spec"
          :data-types-options="dataTypesOptions"
          :disabled="disabled"
        />
      </ElFormItem>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineModel } from 'vue'

  defineOptions({ name: 'SpecFormItem' })
  interface Model {
    dataType: string
    spec?: Api.DataService.DataSpec
  }
  const model = defineModel<Model>({ required: true })

  interface Props {
    dataTypesOptions: string[]
    disabled?: boolean
  }

  defineProps<Props>()

  const lenSpecOf = ['text', 'array']
  const maxSpecOf = ['number']
  const unitSpecOf = ['number']
  const minSpecOf = ['number']
  const stepSpecOf = ['number']
  const boolSpecOf = ['bool']
  const enumSpecOf = ['enum']
  const dataTypeSpecOf = ['array', 'object']

  // 枚举
  const removeEnum = (arr: any[], index: number) => {
    arr.splice(index, 1)
  }
  const addEnum = (arr: any[]) => {
    arr.push({})
  }
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
  const handleDateTypeSelected = () => {
    let currDT = model.value.dataType
    // 重置spec
    model.value.spec = emptySpec
    if (dataTypeSpecOf.includes(currDT)) {
      // 设置子数据类型的spec
      model.value.spec.spec = emptySpec
    }
    console.log('handle data type select', model.value)
  }
</script>

<style scoped>
  .func-model-form {
    .el-input {
      --el-input-width: 300px;
    }
    .el-select {
      --el-select-width: 300px;
    }
    .el-input-number {
      width: 300px;
    }
    .form-item-item {
      .el-input-group {
        width: 300px;
      }
      .el-input-group__prepend {
        width: 50px;
      }
    }
  }
</style>
