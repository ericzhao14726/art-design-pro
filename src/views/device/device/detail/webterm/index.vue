// Terminal.vue
<template>
  <div ref="terminalContainer" class="terminal-container"></div>
</template>
<!-- 这里还需要写一个弹窗，用于数据端口/用户名/密码信息以用于登陆设备，他应该是发送给websockert的第一条信息，如果连接失败则提示重新输入 -->
<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { Terminal } from 'xterm'
  import { FitAddon } from 'xterm-addon-fit'
  import 'xterm/css/xterm.css'

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
      // 发送终端大小给服务器
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
      term.write('Terminal connected!\r\n')
    }

    websocket.onmessage = (event) => {
      let data = event.data
      console.log('Received message:', data)
      term.write(data)
    }

    websocket.onclose = () => {
      term.write('\r\nConnection closed')
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  // 窗口大小变化处理
  const handleResize = () => {
    fitAddon.fit()
  }

  onMounted(() => {
    initTerminal()
    setupWebSocket()
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
</style>
