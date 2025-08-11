import request from '@/utils/http'

export class DataServiceService {
  static getFuncModels(params: Api.DataService.GetFuncModelsRequest) {
    return request.get<Api.DataService.GetFuncModelsResponse>({
      url: '/api/data-service/func-model/list',
      params
    })
  }

  static getFuncModel(modelId: string) {
    return request.get<Api.DataService.GetFuncModelResponse>({
      url: '/api/data-service/func-model/' + modelId
    })
  }

  static createFuncModel(params: Api.DataService.CreateFuncModelRequest) {
    return request.post<Api.DataService.CreateFuncModelResponse>({
      url: '/api/data-service/func-model',
      params
    })
  }

  static deleteFuncModel(modelIds: string[]) {
    return request.del<any>({
      url: '/api/data-service/func-model/' + modelIds.join(',')
    })
  }

  static updateFuncModel(params: Api.DataService.UpdateFuncModelRequest) {
    return request.put<any>({
      url: '/api/data-service/func-model',
      params
    })
  }

  // 数据流

  // static getPropertyData(
  //   param: types.datastream.GetPropertyDataRequest,
  //   pageRequest: types.pagination.PageByCursorRequest
  // ) {
  //   console.log('api getPropertyData', param, pageRequest)
  //   const res = request.get<types.datastream.GetPropertyDataResponse>(
  //     'data/property_post?' + buildUrlParams(pageRequest) + '&' + buildUrlParams(param)
  //   )
  //   console.log('api getPropertyData res', res)
  //   return res
  // }

  // static getEventData(
  //   param: types.datastream.GetEventDataRequest,
  //   pageRequest: types.pagination.PageByCursorRequest
  // ) {
  //   console.log('api getEventData', param, pageRequest)
  //   const res = request.get<types.datastream.GetEventDataResponse>(
  //     'data/event_post?' + buildUrlParams(pageRequest) + '&' + buildUrlParams(param)
  //   )
  //   console.log('api getEventData res', res)
  //   return res
  // }

  // static getServiceData(
  //   param: types.datastream.GetServiceDataRequest,
  //   pageRequest: types.pagination.PageByCursorRequest
  // ) {
  //   console.log('api getServiceData', param, pageRequest)
  //   const res = request.get<types.datastream.GetServiceDataResponse>(
  //     'data/service_set?' + buildUrlParams(pageRequest) + '&' + buildUrlParams(param)
  //   )
  //   console.log('api getServiceData res', res)
  //   return res
  // }
}
