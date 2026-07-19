<template>
  <el-dialog
    :model-value="show"
    width="420px"
    :close-on-click-modal="false"
    :show-close="true"
    align-center
    class="auth-dialog"
    @close="handleClose"
  >
    <div class="auth-modal">
      <div class="auth-hero">
        <p>{{ isRegisterMode ? '注册后即可发送消息、查看历史记录。' : '登录后即可进入社区聊天。' }}</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <el-input v-model="form.username" maxlength="32" placeholder="用户名" @input="handleUsernameInput" />
        <el-input v-model="form.password" type="password" show-password placeholder="密码" @input="clearError" />
        <el-input v-if="isRegisterMode" v-model="form.confirmPassword" type="password" show-password placeholder="确认密码" @input="clearError" />
        <el-button type="primary" class="auth-submit" native-type="submit">
          {{ isRegisterMode ? '注册并进入' : '登录' }}
        </el-button>
      </form>

      <div class="auth-actions">
        <el-button class="auth-switch" text @click="toggleMode">
          {{ isRegisterMode ? '切换到登录' : '没有账号？去注册' }}
        </el-button>
        <el-button class="auth-close" text @click="handleClose">关闭</el-button>
      </div>

      <p class="auth-tip" v-if="errorMessage">{{ errorMessage }}</p>
    </div>
  </el-dialog>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  isRegisterMode: { type: Boolean, default: false },
  form: { type: Object, required: true },
  errorMessage: { type: String, default: '' },
})

const emit = defineEmits(['close', 'toggle-mode', 'login', 'register', 'error'])

const clearError = () => emit('error', '')
const sanitizeUsername = (value = '') => value.replace(/[^\u4e00-\u9fa5A-Za-z0-9_]/g, '')
const handleUsernameInput = (value) => {
  props.form.username = sanitizeUsername(value?.target?.value ?? value ?? props.form.username)
  clearError()
}

const resetForm = () => {
  props.form.username = ''
  props.form.password = ''
  props.form.confirmPassword = ''
  clearError()
}

const handleClose = () => {
  emit('close')
}

const toggleMode = () => {
  clearError()
  emit('toggle-mode')
}

const handleSubmit = () => {
  const { username, password, confirmPassword } = props.form
  if (!username || !username.trim()) {
    emit('error', '请输入用户名')
    return
  }
  if (!password) {
    emit('error', '请输入密码')
    return
  }
  if (props.isRegisterMode) {
    if (password.length < 6) {
      emit('error', '密码至少 6 位')
      return
    }
    if (password !== confirmPassword) {
      emit('error', '两次密码不一致')
      return
    }
  }
  emit(props.isRegisterMode ? 'register' : 'login')
}

watch(() => props.show, (visible) => {
  if (!visible) resetForm()
})
</script>

<style scoped>
.auth-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-hero {
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.auth-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #ff72b1, #ff9c6a);
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.auth-hero h2 {
  margin: 0 0 8px;
  font-size: 22px;
  color: #303133;
}

.auth-hero p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-form .el-input {
  height: 44px;
}

.auth-submit {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
}

.auth-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.auth-switch {
  color: #ff6ba6 !important;
}

.auth-close {
  color: #909399 !important;
}

.auth-tip {
  margin: 0;
  padding: 10px 12px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-dialog__header) {
  display: none;
}

:deep(.el-dialog__body) {
  padding: 28px 24px 24px;
}
</style>