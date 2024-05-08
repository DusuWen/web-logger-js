# web-logger
a js library for web application store log and send log

### usage
#### option one
```bash
git clone
```
```bash
npm i
```
```bash
npm run build
```
copy dist/web-logger-js.js to your project

#### option two
```bash
npm i web-logger-js
```
```javascript
import Logger from "web-logger-js"
```


#### notice
web-logger required token before send logs to your backend server，web-logger built-in sending enqueue.

### setup

in vue project main.js

```javascript
import Vue from 'vue';
import { createRouter } from "vue-router"
import Logger from "web-logger-js"

const router = createRouter()
const logger = new Logger({
  saveToCloud: true, 
  sourceType: "h5", 
  projectName: "xxx", 
  env: "test", 
  encrypt: true, 
  reportUrl: "http://xxx.xxxx.xxxx", 
  router: router
})
Vue.prototype.$logger = logger;
```

in anywhere

```vue
<script>
export default {
    created() {
      this.$logger.setToken("Bearer xxxxxx")
      this.$logger.info("app created")
    },
    mounted() {
      this.$logger.info("app mounted")
    }
};
</script>
```

### options

```javascript
const option = {
	saveToCloud: false, // enable upload log to server，default false
	sourceType: "web", // web/h5
	projectName: "", // current project name,
	env: "test", // current project env
	encrypt: false, // enable 1024 RSA encrypt，default false
	reportUrl: '', // logs server url
	router: "", // vue-router
}
```

### log message
message store in localstorage looks like
```json
{
  "message": "",
  "level": "",
  "timestamp": "",
  "stacktrace": "",
  "userAgent": "",
  "projectName": "",
  "fullPath": "",
  "location": ""
}
```

### API

* setToken (if you need send to your server)

```javascript
logger.setToken("Bearer xxxxx")
```

* info

```js
logger.info("text")
```

* error

```js
logger.error(e)
```
