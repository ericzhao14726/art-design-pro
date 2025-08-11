import request from '@/utils/http'

export class DeviceService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/api/auth/login',
      params
      // showErrorMessage: false // 不显示错误消息
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      url: '/api/user/info'
    })
  }

  // 获取用户列表
  static getUserList(params: Api.Common.PaginatingParams) {
    return request.get<Api.User.UserListData>({
      url: '/api/user/list',
      params
    })
  }

  static getProducts(params: Api.Device.GetProductsRequest) {
    const res = request.get<Api.Device.GetProductsResponse>({
      url: '/api/product/list',
      params
    })
    return res
  }

  static getProduct(productId: string) {
    return request.get<Api.Device.Product>({
      url: 'product/' + productId
    })
  }

  static createProduct(params: Api.Device.CreateProductRequest) {
    return request.post<Api.Device.CreateProductResponse>({
      url: '/api/product',
      params
    })
  }

  static deleteProduct(params: string[]) {
    return request.del<any>({
      url: '/api/product/' + params.join(',')
    })
  }

  static updateProduct(params: Api.Device.UpdateProductRequest) {
    return request.put<any>({
      url: '/api/product',
      params
    })
  }

  static updateProductStatus(params: Api.Device.UpdateProductStatusRequest) {
    return request.put<any>({
      url: '/api/product/status',
      params
    })
  }

  static getDevices(params: Api.Device.GetDevicesRequest) {
    return request.get<Api.Device.GetDevicesResponse>({
      url: '/api/device/list',
      params
    })
  }

  static getDevice(deviceId: string) {
    return request.get<Api.Device.Device>({
      url: '/api/device/' + deviceId
    })
  }

  static createDevice(params: Api.Device.CreateDeviceRequest) {
    return request.post<Api.Device.CreateDeviceResponse>({
      url: '/api/device',
      params
    })
  }

  static deleteDevice(deviceIds: string[]) {
    return request.del<any>({
      url: '/api/device/' + deviceIds.join(',')
    })
  }

  static updateDevice(params: Api.Device.UpdateDeviceRequest) {
    return request.put<any>({
      url: '/api/device',
      params
    })
  }

  static updateDeviceStatus(params: Api.Device.UpdateDeviceStatusRequest) {
    return request.put<any>({
      url: '/api/device/status',
      params
    })
  }

  static getMonitorData(params: Api.Device.GetMonitorDataRequest) {
    return request.get<Api.Device.GetMonitorDataResponse>({
      url: '/api/device/monitor',
      params
    })
  }
}
