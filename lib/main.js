import { JSEncrypt } from 'js-encrypt';

class Main {
	/**
	 * 实例配置
	 * @param config
	 */
	constructor(config) {
		const {
			saveToCloud = false,
			sourceType = "web",
			projectName = "",
			env= "mixin",
			encrypt = false,
			reportUrl= "",
			router = null
		} = config
		this.saveToCloud = saveToCloud // 是否同步保存至云端
		this.sourceType = sourceType // web or h5
		this.projectName = projectName // 记录项目名称
		this.env = env // 日志上报云端环境 test测试/prod系统/mixin融合/rc灰度/release本番
		this.encrypt = encrypt // 是否启用1024位的RSA公钥加密
		this.reportUrl = reportUrl // 日志上报url
		this.router = router // router 实例
		this.key = this.genKey()
		this.rootPath = `/${this.sourceType}` // buket下文件夹路径
		this.logFileName = this.logName() // 日志名称
		this.userAgent = navigator && navigator.userAgent
		this.token = null // 日志上报token
		this.publicKey = "-----BEGIN PUBLIC KEY-----\n" +
			"MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvbDeP+6pgP1LKLA+T9HZ\n" +
			"5iFRj5Wtlc8zbWjQeFyx98VrSzqwTY/UCkrOqqf6pRuhSZ4EajPqkxSlfJWG/mu4\n" +
			"ZSBPMGn+9fbR/ZeZeHHBRTE7EYiU3/Z7baDVRiAIRE8W4KiKcHeRYn+Y5+JqX8DQ\n" +
			"mX+XgErrrxjQ1wY3RpBut0Ull+bkDOgHET3RminQWxYbIBw6yAevEY/LMwcTWr9x\n" +
			"S3wYg5S3T9YLxXGkzpsAuQ8e0pSjqhU9p/kXbf0x9wsew9xlrlyB8JQ0bN+dXOrD\n" +
			"Bpn5XSb56zkzGYbyeY3QROgdy9pPttBLVICTktZurLGqbY9LvieEupmazQ08bhUz\n" +
			"cQIDAQAB\n" +
			"-----END PUBLIC KEY-----"
		this.queue = [] // 队列
		this.isProcessing = false // 队列中是否有请求正在进行
		this.init()
	}
	init() {
		if (this.encrypt) {
			this.encrypt = new JSEncrypt()
			this.encrypt.setPublicKey(this.publicKey)
		}
		const message = this.genMsg("init web logger", "info")
		this.setItem(message)
	}
	setToken(token) {
		this.token = token
		if (this.saveToCloud) {
			const items = localStorage.getItem(this.key)
			let json = []
			if (items !== "null" && items !== null) {
				json = JSON.parse(items)
			}
			if (json.length > 0) {
				this.send(JSON.parse(items))
			}
		}
	}
	info(...val) {
		const message = this.genMsg(val.join(","), "info")
		this.setItem(message)
	}
	error(e) {
		const message = this.genMsg(e.message, "error", e.stack)
		this.setItem(message)
	}
	getCurrentRoute() {
		if (this.router) {
			if (this.router.currentRoute.value) {
				return this.router.currentRoute.value.fullPath
			} else {
				return this.router.currentRoute.fullPath
			}
		} else {
			return ""
		}
	}
	genMsg(message, level, stacktrace = "") {
		return {
			message: !this.encrypt ? message :this.encrypt.encrypt(message),
			level,
			timestamp: new Date(),
			stacktrace,
			userAgent: this.userAgent,
			projectName: this.projectName,
			fullPath: this.getCurrentRoute(),
			location: window.location.href
		}
	}
	genKey() {
		return this.timestamp()
	}
	setItem(item) {
		const items = localStorage.getItem(this.key)
		let json = []
		if (items !== "null" && items !== null) {
			json = JSON.parse(items)
		}
		json.push(item)
		localStorage.setItem(this.key, JSON.stringify(json))
		if (!this.saveToCloud || !this.token || !this.reportUrl) return
		this.send(item)
	}
	logName() {
		return `${this.rootPath}${this.folderName()}/${this.key}-web-log.txt`
	}
	timestamp() {
		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const seconds = date.getSeconds().toString().padStart(2, '0');
		return `${year}${month}${day}${hours}${minutes}${seconds}`
	}
	folderName() {
		const date = new Date();
		const year = date.getFullYear().toString();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `/${year}${month}${day}`
	}
	pemToBuffer(pem) {
		const pemHeader = '-----BEGIN RSA PUBLIC KEY-----';
		const pemFooter = '-----END RSA PUBLIC KEY-----';
		
		const pemContents = pem
			.replace(pemHeader, '')
			.replace(pemFooter, '')
			.replace(/\r/g, '')
			.replace(/\n/g, '');
		
		const binaryString = window.atob(pemContents);
		const length = binaryString.length;
		const bytes = new Uint8Array(length);
		
		for (let i = 0; i < length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		
		return bytes.buffer;
	}
	async encryptWithRas(plaintext) {
		try {
			const encoder = new TextEncoder()
			const data = encoder.encode(plaintext)
			
			const key = await crypto.subtle.importKey(
				"spki",
				this.pemToBuffer(this.publicKey),
				{ name: "RSA-OAEP", hash: "SHA-256" },
				false,
				['encrypt']
			)
			const encryptedData = await crypto.subtle.encrypt(
				{ name: "RAS-OAEP"},
				key,
				data
			)
			const encryptedArray = Array.from(new Uint8Array(encryptedData));
			return btoa(encryptedArray.map(byte => String.fromCharCode(byte)).join(''));
		} catch (e) {
			console.log(e)
		}
	}
	send(message) {
		this.enqueue(message)
		this.processQueue()
	}
	/**
	 * 添加请求到队列
	 * @param option
	 */
	enqueue(option) {
		this.queue.push(option)
	}
	/**
	 * 处理请求队列
	 */
	processQueue() {
		if(!this.isProcessing && this.queue.length > 0) {
			const nextRequest = this.queue.shift()
			this.executeRequest(nextRequest)
		}
	}
	/**
	 * 执行请求队列
	 * @param option
	 */
	executeRequest(option) {
		try {
			this.isProcessing = true
			const xhr = new window.XMLHttpRequest()
			xhr.timeout = 5000
			xhr.open("POST", this.reportUrl, true)
			xhr.setRequestHeader("Authorization", this.token)
			xhr.setRequestHeader('Content-Type', 'application/json');
			const { headers } = this;
			for (const header in headers) {
				if (Object.prototype.hasOwnProperty.call(headers, header)) {
					const value = headers[header];
					if (value) {
						xhr.setRequestHeader(header, value);
					}
				}
			}
			xhr.onreadystatechange = () => {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						this.isProcessing = false
						this.processQueue()
					} else {
						this.isProcessing = false
						this.processQueue()
					}
				}
			}
			xhr.send(JSON.stringify({
				fileName: this.logFileName,
				message: option
			}))
		} catch (e) {
			console.log(e)
		}
	}
}
export default Main
