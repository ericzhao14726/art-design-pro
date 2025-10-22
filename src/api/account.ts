import request from '@/utils/http'

/**
 * 账户管理服务
 */
export class AccountService {
  /**
   * 创建账户
   */
  static async createAccount(
    params: Api.SystemManage.CreateAccountRequest
  ): Promise<Api.SystemManage.CreateAccountResponse> {
    return request.post<Api.SystemManage.CreateAccountResponse>({
      url: 'api/account/createAccount',
      params
    })
  }

  /**
   * 修改账户信息
   */
  static async modifyAccount(params: Api.SystemManage.ModifyAccountRequest): Promise<void> {
    return request.post<any>({
      url: 'api/account/modifyAccount',
      params
    })
  }

  /**
   * 删除账户
   */
  static async deleteAccount(params: Api.SystemManage.DeleteAccountRequest): Promise<void> {
    return request.post<any>({
      url: 'api/account/deleteAccount',
      params
    })
  }

  /**
   * 获取账户列表
   */
  static async getAccounts(
    params: Api.SystemManage.GetAccountsRequest
  ): Promise<Api.SystemManage.GetAccountsResponse> {
    return request.post<Api.SystemManage.GetAccountsResponse>({
      url: 'api/account/getAccounts',
      params
    })
  }

  /**
   * 修改账户状态
   */
  static async modifyAccountStatus(
    params: Api.SystemManage.ModifyAccountStatusRequest
  ): Promise<void> {
    return request.post<any>({
      url: 'api/account/modifyAccountStatus',
      params
    })
  }
}

/**
 * 账户管理API适配器（兼容旧代码）
 */
export const AccountApi = {
  /**
   * 获取账户列表（兼容旧接口）
   */
  async GetAccounts(
    params: Api.SystemManage.GetAccountsRequest
  ): Promise<Api.SystemManage.GetAccountsResponse> {
    return AccountService.getAccounts(params)
  }
}

/**
 * 导出默认实例（兼容旧代码）
 */
export default AccountService
