export const chatMessages = [
  {
    id: 1,
    nickname: '系统',
    text: '欢迎来到社区聊天室，大家可以直接聊天。',
    time: '刚刚',
  },
]

export function addChatMessage(message) {
  chatMessages.push(message)
  return chatMessages
}
