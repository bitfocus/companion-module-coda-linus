export function updateActions() {
	let actions = {}

	actions['standby'] = {
		name: 'Standby',
		options: [
			{
				id: 'standbyState',
				type: 'dropdown',
				label: 'Set Standby State',
				choices: [
					{ id: true, label: 'Enable' },
					{ id: false, label: 'Disable' },
				],
				default: true,
			},
		],
		callback: async ({ options }) => {
			// Message Format: {"command":"set_standby", "enable":true/false (Boolean)}
			let cmd = '{"command":"set_standby", "enable":' + options.standbyState + '}'
			await this.sendCommand(cmd)
		},
	}

	actions['muteAll'] = {
		name: 'Mute All',
		options: [
			{
				id: 'muteState',
				type: 'dropdown',
				label: 'Set Mute All',
				choices: [
					{ id: true, label: 'Enable' },
					{ id: false, label: 'Disable' },
				],
				default: true,
			},
		],
		callback: async ({ options }) => {
			// Message Format: {"command":"set_mute_all", "enable":true/false (Boolean)}
			let cmd = '{"command":"set_mute_all", "enable":' + options.muteState + '}'
			await this.sendCommand(cmd)
		},
	}

	actions['muteChannels'] = {
		name: 'Mute Single Channel',
		options: [
			{
				id: 'channel',
				type: 'dropdown',
				label: 'Channel',
				choices: [
					{ id: '1', label: '1' },
					{ id: '2', label: '2' },
					{ id: '3', label: '3' },
					{ id: '4', label: '4' },
				],
				default: '1',
			},
			{
				id: 'muteState',
				type: 'dropdown',
				label: 'Mute',
				choices: [
					{ id: true, label: 'Enable' },
					{ id: false, label: 'Disable' },
				],
				default: true,
			},
		],
		callback: async ({ options }) => {
			// Message Format: {"command":"set_channel_mute", "channel":Channel number (Number),"enable":true/false (Boolean)}
			let cmd = '{"command":"set_channel_mute", "channel":' + options.channel + ', "enable":' + options.muteState + '}'
			await this.sendCommand(cmd)
		},
	}

	actions['getSnapshotFolders'] = {
		name: 'Get Snapshot Folders',
		options: [],
		callback: async ({ options }) => {
			// Message Format: {"command":"get_snapshot_folders"}
			let cmd = '{"command":"get_snapshot_folders"}'
			await this.sendCommand(cmd)
		},
	}

	actions['getSnapshotLastLoaded'] = {
		name: 'Get Snapshot Last Loaded',
		options: [],
		callback: async ({ options }) => {
			// Message Format: {"command":"get_snapshot_last_loaded"}
			let cmd = '{"command":"get_snapshot_last_loaded"}'
			await this.sendCommand(cmd)
		},
	}

	actions['getSnapshotFiles'] = {
		name: 'Get Snapshot Files',
		options: [
			{
				type: 'textinput',
				label: 'Folder',
				id: 'folder',
				default: '',
				useVariables: false,
			},
		],
		callback: async ({ options }) => {
			// Message Format: {"command":"get_snapshot_files", "folder":folder (String)}
			let cmd = '{"command":"get_snapshot_files", "folder":"' + options.folder + '"}'
			await this.sendCommand(cmd)
		},
	}

	this.setActionDefinitions(actions)
}
