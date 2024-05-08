<script setup>
import { inject, onMounted } from 'vue'
const logger = inject("$logger")
onMounted(() => {
	logger.info("log form demo page")
})
</script>

<template>
	<div><router-link to="/">go home</router-link></div>
</template>

<style scoped>

</style>
