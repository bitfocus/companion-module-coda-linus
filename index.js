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
		this.command = null
		this.standby = []
		this.mute = []
		this.timer = undefined
		this.poll = false

		console.log(this.config)

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()
		this.updatePresets()

		this.initUDP()

		// poll every second
		if (this.config.polling === true) {
			console.log('Starting polling')
			this.poll = true
			this.timer = setInterval(this.dataPoller.bind(this), 1000)
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
		console.log('initUDP ' + this.config.host + ':' + this.config.port)

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
			this.updateStatus(InstanceStatus.Disconnected)
		}

		if (this.config.host) {
			this.socket = new UDPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.log('info', 'UDP status change: ' + status)
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				console.log('UDP error', err)
				this.log('error', 'Network error: ' + err.message)
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this.poll = false
			})

			this.socket.on('listening', () => {
				console.log('UDP Listening')
				this.updateStatus(InstanceStatus.Ok)
			})

			this.socket.on('data', (msg) => {
				console.log('received data')
				this.log('debug', 'Received Data: ' + msg.toString('utf-8', 0, msg.length))
			})

		}
	}

	processDeviceInformation(data) {
		console.log('device information process : ' + data)
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

		// poll every second
		if (this.config.polling === true) {
			console.log('Starting polling')
			this.poll = true
			this.timer = setInterval(this.dataPoller.bind(this), 1000)
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
		this.log('debug', 'sending: ' + cmd)
		if (cmd !== undefined) {
			if (this.socket !== undefined && !this.socket.isDestroyed) {
				await this.socket
				.send(cmd)
				.then(() => {})
				.catch((error) => {
					this.log('warn', 'Error sending message ' + error)
				})
			} else {
				this.log('warn', 'Socket not connected')
			}
		}
	}

	async dataPoller() {
		if (this.socket !== undefined && !this.socket.isDestroyed && this.poll) {
			// Message Format: {"command":"get_standby"}
			// Message Format: {"command":"get_channel_mute", "channel":Channel number (Number)}
			await this.sendCommand('{"command":"get_standby"}')
			await this.sendCommand('{"command":"get_channel_mute", "channel":1}')
			await this.sendCommand('{"command":"get_channel_mute", "channel":2}')
			await this.sendCommand('{"command":"get_channel_mute", "channel":3}')
			await this.sendCommand('{"command":"get_channel_mute", "channel":4}')
		} else {
			this.log('debug', 'dataPoller - Socket not connected')
		}
	}
}

runEntrypoint(CodaLinus, upgradeScripts)
