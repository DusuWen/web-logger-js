import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Demo from "./views/Demo.vue"
import Index from "./views/Index.vue"
import { createRouter, createWebHashHistory} from "vue-router"
const app = createApp(App)

const routes = [
	{
		path: "/",
		component: Index
	},
	{
		path: "/demo",
		component: Demo
	}
]
const router = createRouter({
	history: createWebHashHistory(),
	routes
})
app.use(router)
import Logger from "../lib/main.js"
const logger = new Logger({
	saveToCloud: true,
	sourceType: "web",
	projectName: "xxx",
	env: "mixin",
	encrypt: false,
	reportUrl: "",
	router: router
})
app.provide("$logger", logger)
app.mount('#app')
