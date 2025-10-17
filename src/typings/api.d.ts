/**
 * namespace: Api
 *
 * 所有接口相关类型定义
 * 在.vue文件使用会报错，需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'

    interface PageByNoRequest {
      pageNo: number
      perPage: number
    }

    interface PageByNoResult {
      currentPageNo: number
      totalCount: number
      totalPage: number
      isEnd: boolean
    }

    interface PageByCursorRequest {
      cursor: string
      perPage: number
    }

    interface PageByCursorResult {
      cursor: string
      total: number
    }
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }
  /** 设备管理 */
  namespace Device {
    interface Product {
      productId: string
      name: string
      description: string
      enable: boolean
      createdAt: number
      updatedAt: number
      creator: string
      editor: string
      funcModels: string[]
    }

    interface ProductListData {
      products: Product[]
      pageResult: PageByNoResult
    }
    interface CreateProductRequest {
      name: string
      description: string
    }
    interface CreateProductResponse {
      productId: string
    }
    interface GetProductsResponse {
      products: Product[]
      pageResult: Common.PageByNoResult
    }
    interface GetProductsRequest extends Common.PageByNoRequest {
      name: string
    }
    interface GetProductRequest {
      productId: string
    }
    interface DeleteProductRequest {
      productIds: string[]
    }
    interface UpdateProductRequest {
      productId: string
      name: string
      description: string
    }
    interface UpdateProductStatusRequest {
      productId: string
      toEnable: boolean
    }
    interface Device {
      deviceId: string
      productId: string
      productName: string
      name: string
      description: string
      enable: boolean
      isOnline: boolean
      lastOnlineTime: number
      createdAt: number
      updatedAt: number
      creator: string
      editor: string
    }

    interface CreateDeviceRequest {
      productId: string
      name: string
      description: string
    }

    interface CreateDeviceResponse {
      deviceId: string
    }

    interface GetDevicesResponse {
      devices: Device[]
      pageResult: Common.PageByNoResult
    }

    interface GetDevicesRequest extends Common.PageByNoRequest {
      productId: string
      name: string
    }

    interface UpdateDeviceRequest {
      deviceId: string
      name: string
      description: string
    }

    interface GetDeviceRequest {
      deviceId: string
    }
    interface DeleteDeviceRequest {
      deviceIds: string[]
    }
    interface UpdateDeviceStatusRequest {
      deviceId: string
      toEnable: boolean
    }

    interface GetMonitorDataRequest extends Common.PageByCursorRequest {
      deviceId: string
      productId: string
      name: string
      queryBaseTime: number
      beforeSecond: number
    }

    interface GetMonitorDataResponse {
      metricData: MetricResults
      pageResult: Common.PageByCursorResult
    }

    interface MetricResults {
      name: string
      labels: Map<string, string>
      values: MetricValue[]
    }

    interface MetricValue {
      t: number
      v: number
    }
  }

  namespace DataService {
    interface FuncModel extends FuncModelDataType {
      funcModelId: string
      type: string
      input: FuncModelDataType[]
      output: FuncModelDataType[]
      propertyType: string // 属性类型
      eventType: string // 事件类型
      serviceType: string // 服务类型
      description: string // 描述
      createdAt: number
      updatedAt: number
      creator: string
      editor: string
    }

    interface FuncModelDataType {
      name: string // 功能名称
      key: string // 功能唯一Key 产品下唯一
      dataType: string // 数据类型
      spec: DataSpec // 数据规格
    }
    interface DataSpec {
      max: number // Max 最大值 仅在DataTypeNumber下有效
      min: number // Min 最小值 仅在DataTypeNumber下有效
      step: number // Step 步长 仅在DataTypeNumber下有效
      unit: string // Unit 单位 仅在DataTypeNumber下有效
      len: number // Len 长度 仅在DataTypeArray DataTypeString下有效
      dataType: string // DataType 子数据类型 仅在DataTypeArray DataTypeMap下有效
      bool: BoolMean // Bool 布尔值含义 仅在DataTypeBool下有效
      enum: EnumMean[] // Enum 枚举含义 仅在DataTypeEnum下有效
      spec?: DataSpec // Spec 子数据类型规格 仅在DataTypeArray下有效
    }

    // BoolMean 布尔值含义
    interface BoolMean {
      trueValue: string // 为True是的含义
      falseValue: string // 为False时的含义 class
    }

    // EnumMean 枚举含义
    interface EnumMean {
      name: string
      mean: string
    }

    interface GetFuncModelsRequest extends Common.PageByNoRequest {
      modelIds: string[]
      name: string
      modelType: string
    }

    interface GetFuncModelsResponse {
      funcModels: FuncModel[]
      pageResult: Common.PageByNoResult
    }

    interface GetFuncModelRequest {
      funcModelId: string
    }

    interface DeleteFuncModelRequest {
      funcModelIds: string[]
    }

    interface CreateFuncModelRequest {
      type: string
      input: FuncModelDataType[]
      output: FuncModelDataType[]
      propertyType: string // 属性类型
      eventType: string // 事件类型
      serviceType: string // 服务类型
      description: string // 描述
    }

    interface CreateFuncModelResponse {
      funcModelId: string
    }
    interface GetFuncModelResponse extends FuncModel {
      _: any // 占位符，避免接口返回空对象
    }
    interface UpdateFuncModelRequest extends FuncModel {
      _: any // 占位符，避免接口返回空对象
    }
  }
}
