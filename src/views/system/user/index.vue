<!-- 用户管理 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的 高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
            <ElButton
              v-if="selectedRows.length > 0"
              @click="batchDeleteUsers"
              type="danger"
              v-ripple
            >
              批量删除
            </ElButton>
          </ElSpace>
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

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { h, nextTick } from 'vue'
  import { ElTag, ElMessageBox, ElMessage, ElSwitch } from 'element-plus'
  import { useTable } from '@/composables/useTable'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { AccountService } from '@/api/account'
  import { timestampToTime } from '@/utils/dataprocess/format'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.AccountListItem

  // 弹窗相关
  const dialogType = ref<'add' | 'edit'>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: '',
    userPhone: '',
    userEmail: '',
    status: 0
  })

  // API 请求函数适配器
  const fetchGetUserList = async (params: any) => {
    const response = await AccountService.getAccounts({
      name: params.userName || '',
      mobile: params.userPhone || '',
      email: params.userEmail || '',
      status: params.status || 0,
      pageNo: params.current,
      perPage: params.size
    })

    return {
      records: response.accounts || [],
      current: response.pageResult.currentPageNo,
      size: params.size || 10,
      total: response.pageResult.totalCount
    }
  }

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    1: { type: 'success' as const, text: '启用' },
    2: { type: 'danger' as const, text: '禁用' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: number) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
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
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 10,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'avatar',
          label: '用户名',
          width: 280,
          formatter: (row: UserListItem) => {
            return h('div', { class: 'user', style: 'display: flex; align-items: center' }, [
              h('img', {
                class: 'avatar',
                src: row.avatar,
                style: 'width: 40px; height: 40px; border-radius: 6px;'
              }),
              h('div', { style: 'margin-left: 10px' }, [
                h(
                  'p',
                  {
                    class: 'user-name',
                    style: 'font-weight: 500; color: var(--art-text-gray-800); margin: 0;'
                  },
                  row.nickName + '(' + row.name + ')'
                ),
                h(
                  'p',
                  {
                    class: 'email',
                    style: 'color: var(--art-text-gray-500); margin: 0; font-size: 12px;'
                  },
                  row.email
                )
              ])
            ])
          }
        },
        { prop: 'mobile', label: '手机号' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row: UserListItem) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'enable',
          label: '启用状态',
          formatter: (row: UserListItem) => {
            return h(ElSwitch, {
              modelValue: row.status === 1,
              onClick: () => updateAccountStatus(row.uid, row.status !== 1)
            })
          }
        },
        {
          prop: 'createTime',
          label: '创建',
          formatter: (row: UserListItem) => {
            return h('div', { class: 'user', style: 'display: flex; align-items: center' }, [
              h('div', {}, [
                h('p', { style: 'margin: 0;' }, row.creator),
                h(
                  'p',
                  { style: 'margin: 0; color: var(--art-text-gray-500); font-size: 12px;' },
                  timestampToTime(row.createdAt, false)
                )
              ])
            ])
          },
          sortable: true
        },
        {
          prop: 'updateTime',
          label: '更新',
          formatter: (row: UserListItem) => {
            return h('div', { class: 'user', style: 'display: flex; align-items: center' }, [
              h('div', {}, [
                h('p', { style: 'margin: 0;' }, row.editor),
                h(
                  'p',
                  { style: 'margin: 0; color: var(--art-text-gray-500); font-size: 12px;' },
                  timestampToTime(row.updatedAt, false)
                )
              ])
            ])
          },
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right', // 固定列
          formatter: (row: UserListItem) => {
            return h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
          }
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Record<string, any>) => {
    console.log('搜索参数:', params)
    // 搜索参数赋值
    Object.assign(searchParams, params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: 'add' | 'edit', row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      AccountService.deleteAccount({ uids: [row.uid] })
        .then(() => {
          refreshData()
          ElMessage.success('删除成功')
        })
        .catch((error) => {
          console.error('删除用户失败:', error)
          ElMessage.error('删除用户失败')
        })
    })
  }

  /**
   * 批量删除用户
   */
  const batchDeleteUsers = (): void => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的用户')
      return
    }

    ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个用户吗？`, '批量删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      const userIds = selectedRows.value.map((user) => user.uid)
      AccountService.deleteAccount({ uids: userIds })
        .then(() => {
          refreshData()
          selectedRows.value = []
          ElMessage.success('批量删除成功')
        })
        .catch((error) => {
          console.error('批量删除用户失败:', error)
          ElMessage.error('批量删除用户失败')
        })
    })
  }

  /**
   * 更新账户状态
   */
  const updateAccountStatus = (userId: string, toEnable: boolean): void => {
    AccountService.modifyAccountStatus({ uid: userId, toEnable })
      .then(() => {
        refreshData()
        ElMessage.success(toEnable ? '启用成功' : '禁用成功')
      })
      .catch((error) => {
        console.error('更新账户状态失败:', error)
        ElMessage.error('更新账户状态失败')
      })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData()
      ElMessage.success(dialogType.value === 'add' ? '创建用户成功' : '修改用户成功')
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>

<style lang="scss" scoped>
  .user-page {
    :deep(.user) {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }

        .email {
          color: var(--art-text-gray-500);
          font-size: 12px;
        }
      }
    }
  }
</style>
