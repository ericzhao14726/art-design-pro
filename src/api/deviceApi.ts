import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'

export class DeviceService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/api/auth/login',
      params
      // showErrorMessage: false // 不显示错误消息
    })
  }

  static getProducts(params: Api.Device.GetProductsRequest) {
    return request.post<Api.Device.GetProductsResponse>({
      url: '/api/device-manager/getProducts',
      params
    })
  }

  static getProduct(productId: string) {
    return request.post<Api.Device.Product>({
      url: '/api/device-manager/getProduct',
      params: { productId }
    })
  }

  static createProduct(params: Api.Device.CreateProductRequest) {
    return request.post<Api.Device.CreateProductResponse>({
      url: '/api/device-manager/createProduct',
      params
    })
  }

  static deleteProduct(productIds: string[]) {
    return request.post<any>({
      url: '/api/device-manager/deleteProduct',
      params: { productIds }
    })
  }

  static updateProduct(params: Api.Device.UpdateProductRequest) {
    return request.post<any>({
      url: '/api/device-manager/modifyProduct',
      params
    })
  }

  static updateProductStatus(params: Api.Device.UpdateProductStatusRequest) {
    return request.post<any>({
      url: '/api/device-manager/modifyProductStatus',
      params
    })
  }

  static getDevices(params: Api.Device.GetDevicesRequest) {
    return request.post<Api.Device.GetDevicesResponse>({
      url: '/api/device-manager/getDevices',
      params
    })
  }

  static getDevice(deviceId: string) {
    return request.post<Api.Device.Device>({
      url: '/api/device-manager/getDevice',
      params: { deviceId }
    })
  }

  static createDevice(params: Api.Device.CreateDeviceRequest) {
    return request.post<Api.Device.CreateDeviceResponse>({
      url: '/api/device-manager/createDevice',
      params
    })
  }

  static deleteDevice(deviceIds: string[]) {
    return request.post<any>({
      url: '/api/device-manager/deleteDevice',
      params: { deviceIds }
    })
  }

  static updateDevice(params: Api.Device.UpdateDeviceRequest) {
    return request.post<any>({
      url: '/api/device-manager/modifyDevice',
      params
    })
  }

  static updateDeviceStatus(params: Api.Device.UpdateDeviceStatusRequest) {
    return request.post<any>({
      url: '/api/device-manager/modifyDeviceStatus',
      params
    })
  }

  static getMonitorData(params: Api.Device.GetMonitorDataRequest) {
    return request.post<Api.Device.GetMonitorDataResponse>({
      url: '/api/device-manager/getMonitorData',
      params
    })
  }

  // 功能模型相关API
  static getFuncModels(params: Api.DataService.GetFuncModelsRequest) {
    return request.post<Api.DataService.GetFuncModelsResponse>({
      url: '/api/device-manager/getFuncModels',
      params
    })
  }

  static getFuncModel(funcModelId: string) {
    return request.post<Api.DataService.GetFuncModelResponse>({
      url: '/api/device-manager/getFuncModel',
      params: { funcModelId }
    })
  }

  static createFuncModel(params: Api.DataService.CreateFuncModelRequest) {
    return request.post<Api.DataService.CreateFuncModelResponse>({
      url: '/api/device-manager/createFuncModel',
      params
    })
  }

  static deleteFuncModel(funcModelIds: string[]) {
    return request.post<any>({
      url: '/api/device-manager/deleteFuncModel',
      params: { funcModelIds }
    })
  }

  static updateFuncModel(params: Api.DataService.UpdateFuncModelRequest) {
    return request.post<any>({
      url: '/api/device-manager/modifyFuncModel',
      params
    })
  }

  // Web终端
  static createWebTerminal(deviceId: string) {
    return request.post<any>({
      url: '/api/device-manager/createWebTerminal',
      params: { deviceId }
    })
  }

  // WebSocket终端连接
  static createWebSocketTerminal() {
    const { VITE_API_PROXY_URL } = import.meta.env
    const baseUrl = VITE_API_PROXY_URL.replace(/^http/, 'ws')
    // 构建WebSocket URL，自动携带token
    const { accessToken } = useUserStore()
    const wsUrl = `${baseUrl}device-manager/createWebTerminal/${accessToken}`
    return new WebSocket(wsUrl)
  }
}
