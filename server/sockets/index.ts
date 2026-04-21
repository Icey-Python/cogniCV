import http from 'http'
import { WebSocketServer } from 'ws'
import { jsonToObj } from '../lib/utils'

// Setup websocket server
export async function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (wsClient) => {
    // Listen for messages from Client socket
    wsClient.on('message', (message) => {
      let request = jsonToObj(message.toString())

      if (request.msg_type === 'user.auth') {
      }

      if (request.msg_type === 'pay.withdraw.code') {
      }

      if (request.msg_type === 'pay.withdraw.complete') {
      }
    })

    wsClient.on('close', () => {
      console.log('Client disconnected')
    })
  })

  wss.on('close', () => {
    console.log('Server closed')
  })

  wss.on('error', (err) => {
    console.error(err)
  })

  return wss
}
