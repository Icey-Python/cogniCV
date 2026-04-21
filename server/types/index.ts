export interface IServerResponse {
  status: 'success' | 'error'
  message: string
  data: any
}

type WsMessageType =
  | 'user.auth'
  | 'user.acct'
  | 'user.balance'
  | 'auth.error'
  | 'pay.deposit'
  | 'pay.withdraw.code'
  | 'pay.withdraw.complete'

export interface WsMessageDataType {
  msg_type: WsMessageType
  msg_res: {
    status: 'success' | 'error'
    message: string
    data: any
  }
}
