// Terminal.vue
<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="设备登录"
      width="30%"
      :modal="true"
      :close-on-click-modal="false"
      :center="true"
    >
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="端口">
          <el-input v-model="loginForm.port" placeholder="请输入端口号" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </template>
    </el-dialog>
    <div v-if="showReconnect" class="reconnect-container">
      <el-button
        type="primary"
        @click="
          showReconnect = false; dialogVisible = true
        "
        >重新连接</el-button
      >
    </div>
    <div ref="terminalContainer" class="terminal-container"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'
  import 'xterm/css/xterm.css'
  import { ElMessage } from 'element-plus'

  const props = defineProps({
    wsUrl: {
      type: String,
      required: true,
      default: 'ws://localhost:3996/console/device/terminal/dev-g3341c9j'
    }
  })

  const terminalContainer = ref<HTMLElement>()
  let term: Terminal
  let websocket: WebSocket
  const fitAddon = new FitAddon()
  const dialogVisible = ref(true)
  const showReconnect = ref(false)
  const loginForm = ref({
    port: '',
    username: '',
    password: ''
  })

  // 初始化终端
  const initTerminal = () => {
    term = new Terminal({
      theme: {
        background: '#1a242d',
        foreground: '#e2ebe7',
        cursor: 'rgba(229, 229, 229, 0.5)'
      },
      fontSize: 14,
      cursorBlink: true,
      disableStdin: false
    })

    term.loadAddon(fitAddon)
    term.open(terminalContainer.value!)
    fitAddon.fit()

    // 输入事件处理
    term.onData((data) => {
      websocket.send(data)
    })

    // 添加终端大小调整通知
    term.onResize((size) => {
      websocket.send(
        JSON.stringify({
          type: 'resize',
          cols: size.cols,
          rows: size.rows
        })
      )
    })
  }

  // WebSocket处理
  const setupWebSocket = () => {
    websocket = new WebSocket(props.wsUrl)

    websocket.onopen = () => {
      // 发送登录信息作为第一条消息
      websocket.send(
        JSON.stringify({
          type: 'login',
          port: loginForm.value.port,
          username: loginForm.value.username,
          password: loginForm.value.password
        })
      )
      term.write('Terminal connected!\r\n')
      dialogVisible.value = false
      showReconnect.value = false
    }

    websocket.onmessage = (event) => {
      let data = event.data
      console.log('Received message:', data)
      term.write(data)
    }

    websocket.onclose = () => {
      term.write('\r\nConnection closed')
      ElMessage.error('连接失败，请检查登录信息并重试')
      showReconnect.value = true
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      ElMessage.error('连接错误，请检查网络或服务器状态')
      showReconnect.value = true
    }
  }

  // 登录处理
  const handleLogin = () => {
    if (!loginForm.value.port || !loginForm.value.username || !loginForm.value.password) {
      ElMessage.warning('请填写完整的登录信息')
      return
    }
    setupWebSocket()
  }

  // 窗口大小变化处理
  const handleResize = () => {
    fitAddon.fit()
  }

  onMounted(() => {
    initTerminal()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    if (websocket) websocket.close()
    if (term) term.dispose()
    window.removeEventListener('resize', handleResize)
  })
</script>

<style>
  .terminal-container {
    width: 100%;
    height: 700px;
    padding: 20px;
    background-color: #1a242d;
    margin-right: 20px;
  }
  .reconnect-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }
</style>
