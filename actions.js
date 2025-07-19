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
		name: 'Mute Channels',
		options: [
			{
				id: '1',
				type: 'checkbox',
				label: 'Channel 1',
				default: true,
			},
			{
				id: '2',
				type: 'checkbox',
				label: 'Channel 2',
				default: true,
			},
			{
				id: '3',
				type: 'checkbox',
				label: 'Channel 3',
				default: true,
			},
			{
				id: '4',
				type: 'checkbox',
				label: 'Channel 4',
				default: true,
			},
		],
		callback: async ({ options }) => {
			// Message Format: {"command":"set_channel_mute", "channel":Channel number (Number),"enable":true/false (Boolean)}
			for (const ch in options) {
				// console.log(ch)
				let cmd = '{"command":"set_channel_mute", "channel":' + ch + ', "enable":' + options[ch] + '}'
				await this.sendCommand(cmd)
			}
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
