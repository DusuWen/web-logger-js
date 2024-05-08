<script setup>
import { ref, inject } from 'vue'

const logger = inject("$logger")
defineProps({
  msg: String,
})

const count = ref(0)

const handleClick = () => {
	count.value++
	logger.info(count.value)
}

const handleToken = () => {
	logger.setToken("Bearer aaa")
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="handleClick">点击按键增加日志，当前日志个数 {{ count }}</button>
  </div>
	<div class="card">
		<button type="button" @click="handleToken">设置token</button>
	</div>
	<div class="card">
		<router-link to="/demo">
			<button type="button">to demo</button>
		</router-link>
	</div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
