<template>
  <ArtSearchBar
    class="art-search-bar"
    v-model:filter="formFilters"
    :items="formItems"
    @reset="handleReset"
    @search="handleSearch"
    :elColSpan="12"
  />
  <ElRow :gutter="20">
    <ElCol :xs="24" :md="12" :lg="8" v-for="item in monitorMetrics" :key="item.name">
      <div class="monitor-card art-custom-card">
        <div class="card-header">
          <span>{{ item.name }}</span>
        </div>
        <ArtLineChart :data="item.data" :xAxisData="item.xAxis" symbol="none" :symbolSize="7" />
      </div>
    </ElCol>
  </ElRow>
</template>
<script setup lang="ts">
  import { DeviceService } from '@/api/deviceApi'
  import { SearchChangeParams, SearchFormItem } from '@/types'
  import { timestampToTime, timeToTimestamp } from '@/utils'

  defineOptions({ name: 'DeviceMonitor' })

  const dateShortcuts = [
    {
      text: '最近5分钟',
      value: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 5 * 60 * 1000)
        return [start, end] as [Date, Date]
      }
    },
    {
      text: '最近15分钟',
      value: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 15 * 60 * 1000)
        return [start, end] as [Date, Date]
      }
    },
    {
      text: '最近30分钟',
      value: () => {
        const end = new Date()
        const start = new Date(end.getTime() - 30 * 60 * 1000)
        return [start, end] as [Date, Date]
      }
    },
    {
      text: '今天',
      value: () => {
        // 今天0点到今天23:59:59
        const end = new Date()
        end.setHours(23, 59, 59, 0)
        return [new Date(), end] as [Date, Date]
      }
    },
    {
      text: '昨天',
      value: () => {
        // 昨天0点到昨天23:59:59
        const end = new Date()
        end.setDate(end.getDate() - 1)
        end.setHours(23, 59, 59, 0)
        const start = new Date(end.getTime())
        start.setHours(0, 0, 0, 0)
        return [start, end] as [Date, Date]
      }
    },
    {
      text: '最近7天',
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 6)
        return [start, end] as [Date, Date]
      }
    }
  ]
  const props = defineProps({
    productId: {
      type: String,
      required: true
    },
    deviceId: {
      type: String,
      required: true
    }
  })

  const getDefaultTimeRange = () => {
    const end = new Date()
    const start = new Date(end.getTime() - 5 * 60 * 1000)
    return [
      useDateFormat(start, 'YYYY-MM-DD HH:mm:ss').value,
      useDateFormat(end, 'YYYY-MM-DD HH:mm:ss').value
    ]
  }

  // 定义表单搜索初始值
  const initialSearchState = {
    dataTimeRanges: getDefaultTimeRange()
  }

  // 重置表单
  const handleReset = () => {
    initialSearchState.dataTimeRanges = getDefaultTimeRange()
    console.log(initialSearchState)
    Object.assign(formFilters, { ...initialSearchState })
  }

  // 搜索处理
  const handleSearch = () => {
    console.log('搜索参数:', formFilters)
    // 获取监控数据
    for (let i = 0; i < monitorMetrics.length; i++) {
      getDeviceMonitor(monitorMetrics[i].metric).then((res) => {
        monitorMetrics[i].data = res.metricData.values?.map((item: any) => {
          let rt = item.v.toString().includes('.') ? parseFloat(item.v.toFixed(2)) : item.v
          if (['NetworkRx', 'NetworkTx'].includes(monitorMetrics[i].name)) {
            rt = parseFloat((item.v / 1024 / 1024).toFixed(2))
          }
          return rt
        })
        monitorMetrics[i].xAxis = res.metricData.values?.map((item: any) =>
          timestampToTime(item.t, false)
        )
        monitorMetrics[i].data?.reverse()
        monitorMetrics[i].xAxis?.reverse()
      })
    }
    console.log('monitor', monitorMetrics)
  }

  // 表单项变更处理
  const handleFormChange = (params: SearchChangeParams): void => {
    console.log('表单项变更:', params)
  }

  // 响应式表单数据
  const formFilters = reactive({ ...initialSearchState })

  // 表单配置项
  const formItems: SearchFormItem[] = [
    {
      label: '时间范围',
      prop: 'dataTimeRanges',
      type: 'datetimerange',
      config: {
        clearable: true,
        type: 'datetimerange',
        shortcuts: dateShortcuts
      },
      onChange: handleFormChange
    }
  ]

  interface MonitorMetric {
    name: string
    metric: string
    data: number[]
    xAxis: string[]
  }

  const monitorMetrics = reactive<MonitorMetric[]>([
    { name: 'CPU', metric: 'device_cpu_usage_percent', data: [], xAxis: [] },
    { name: 'Memory', metric: 'device_memory_usage_percent', data: [], xAxis: [] },
    { name: 'Disk', metric: 'device_disk_usage_percent', data: [], xAxis: [] },
    { name: 'NetworkRx', metric: 'device_network_receive_bytes', data: [], xAxis: [] },
    { name: 'NetworkTx', metric: 'device_network_transmit_bytes', data: [], xAxis: [] }
  ])

  const getDeviceMonitor = async (metricName: string) => {
    const startTime = timeToTimestamp(formFilters.dataTimeRanges[0], false)
    const endTime = timeToTimestamp(formFilters.dataTimeRanges[1], false)
    const params = <Api.Device.GetMonitorDataRequest>{
      productId: props.productId,
      deviceId: props.deviceId,
      name: metricName,
      queryBaseTime: endTime,
      beforeSecond: endTime - startTime,
      cursor: '',
      count: 1000
    }
    console.log('getDeviceMonitor params:', params)
    const res = await DeviceService.getMonitorData(params)
    return res
  }
  onMounted(() => {
    setTimeout(() => {
      console.log('onMounted => props', props)
      handleReset()
      handleSearch()
    }, 1000)
  })
</script>
<style lang="css" scoped>
  .art-search-bar {
    margin-bottom: 12px;
  }
  .el-col {
    margin-bottom: 20px;
  }
</style>
