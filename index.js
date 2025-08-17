// Coda Linus

import { InstanceBase, InstanceStatus, Regex, runEntrypoint, UDPHelper } from '@companion-module/base'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedback.js'
import { updatePresets } from './presets.js'
import { updateVariables } from './variables.js'
import { upgradeScripts } from './upgrades.js'

class CodaLinus extends InstanceBase {
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		this.updatePresets = updatePresets.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module will allow you to control CODA Audio amplifiers using the LINUS 6.4 protocol.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Device IP or Hostname',
				width: 6,
				regex: Regex.HOSTNAME,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Device Port',
				width: 6,
				default: '6791',
				regex: Regex.PORT,
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable device polling',
				width: 6,
				default: false,
			},
		]
	}

	async destroy() {
		if (this.timer) {
			clearInterval(this.timer)
			delete this.timer
		}

		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		console.log('destroy', this.id)
	}

	async init(config) {
		console.log('init Coda Linus')

		this.config = config
		this.standbyState = undefined
		this.muteState = { 1: null, 2: null, 3: null, 4: null }
		this.timer = undefined
		this.poll = false
		this.pollIndex = 0
		this.pollCommands = [
			{ command: 'get_standby' },
			{ command: 'get_channel_mute', channel: 1 },
			{ command: 'get_channel_mute', channel: 2 },
			{ command: 'get_channel_mute', channel: 3 },
			{ command: 'get_channel_mute', channel: 4 },
		]

		console.log(this.config)

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()
		this.updatePresets()

		this.initUDP()

		// poll every 2 seconds
		if (this.config.polling === true) {
			console.log('Starting polling')
			this.poll = true
			this.timer = setInterval(this.dataPoller.bind(this), 2000)
		} else {
			this.poll = false
			if (this.timer) {
				clearInterval(this.timer)
				delete this.timer
			}
			console.log('Stop polling')
		}
	}

	initUDP() {
		console.log(`initUDP ${this.config.host}:${this.config.port}`)

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
			this.updateStatus(InstanceStatus.Disconnected)
		}

		if (this.config.host) {
			this.socket = new UDPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.log('info', `UDP status change: ${status}`)
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.poll = false
			})

			this.socket.on('listening', () => {
				console.log('UDP Listening')
				this.updateStatus(InstanceStatus.Ok)
			})

			this.socket.on('data', (msg) => {
				// console.log('received data')
				let response
				try {
					response = JSON.parse(msg)
					this.processDeviceInformation(response)
				} catch (e) {
					this.log('warning', e.message)
				}
			})
		}
	}

	processDeviceInformation(data) {
		// console.log('device information process')
		// this.log('debug', JSON.stringify(data))
		if ('command' in data) {
			switch (data.command) {
				case 'get_device_info':
					// Example Reply: {"command": "get_device_info", "hw_addr": "04:89:5B:6D:E2:DA", "ip_addr":"192.168.1.30", "ip_mask": "255.255.255.0", "model": "LINUS6.4", "serial": "LI24110021","sw_version": "V1.3", "hw_version": "V1.1", "desc": "LINUS"}
					this.log('debug', `device info: ${JSON.stringify(data)}`)
					this.setVariableValues(data)
					break
				case 'set_standby':
				case 'get_standby':
					// Example Reply: {"standby": true, "status": "OK", "command": "set_standby"}
					// Example Reply: {"standby": true, "status": "OK", "command": "get_standby"}
					this.log('debug', `get/set standby: ${data.standby}`)
					this.standbyState = data.standby
					this.checkFeedbacks('standbyFeedback')
					break
				case 'set_mute_all':
					// Example Reply: {"mute": true, "status": "OK", "command": "set_mute_all"}
					this.log('debug', `mute all: ${data.mute}`)
					if (data.mute == true) {
						this.updateMuteStatus(true)
					} else if (data.mute == false) {
						this.updateMuteStatus(false)
					} else {
						this.updateMuteStatus(null)
					}
					this.checkFeedbacks('muteFeedback', 'muteAllFeedback')
					break
				case 'set_channel_mute':
				case 'get_channel_mute':
					// Example Reply: {"channel": 3, "mute": true, "status": "OK", "command": "set_channel_mute"}
					// Example Reply: {"channel": 1, "mute": true, "status": "OK", "command": "get_channel_mute"}
					this.log('debug', `get/set mute: ${data.channel} : ${data.mute}`)
					if (data.channel != undefined && data.mute != undefined) {
						this.muteState[data.channel] = data.mute
						this.checkFeedbacks('muteFeedback', 'muteAllFeedback')
					}
					this.log('debug', `${JSON.stringify(this.muteState)}`)
					break
				case 'get_snapshot_folders':
					break
				case 'get_snapshot_files':
					break
				case 'get_snapshot_last_loaded':
					break
				default:
					this.log('debug', `Unknown response command: ${JSON.stringify(data)}`)
			}
		} else {
			this.log('warn', 'no command in message from device')
		}
	}

	async configUpdated(config) {
		console.log('configUpdated')

		let resetConnection = false

		if (this.config.host != config.host) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true || this.socket === undefined) {
			this.initUDP()
		}

		// poll every 2 seconds
		if (this.config.polling === true) {
			console.log('Starting polling')
			this.poll = true
			this.timer = setInterval(this.dataPoller.bind(this), 2000)
		} else {
			console.log('Stop polling')
			this.poll = false
			if (this.timer) {
				clearInterval(this.timer)
				delete this.timer
			}
		}
	}

	async sendCommand(cmd) {
		this.log('debug', `sending: ${cmd}`)
		if (cmd !== undefined) {
			if (this.socket !== undefined && !this.socket.isDestroyed) {
				await this.socket
					.send(cmd)
					.then(() => {})
					.catch((error) => {
						this.log('warn', `Error sending message ${error}`)
					})
			} else {
				this.log('warn', 'Socket not connected')
			}
		}
	}

	async dataPoller() {
		if (this.socket !== undefined && !this.socket.isDestroyed && this.poll) {
			let cmd = this.pollCommands[this.pollIndex]
			await this.sendCommand(JSON.stringify(cmd))
			if (this.pollIndex < this.pollCommands.length - 1) {
				this.pollIndex++
			} else {
				this.pollIndex = 0
			}
		} else {
			this.log('debug', 'dataPoller - Socket not connected')
		}
	}

	updateMuteStatus(value) {
		Object.keys(this.muteState).forEach((item) => {
			this.muteState[item] = value
		})
	}
}

runEntrypoint(CodaLinus, upgradeScripts)
