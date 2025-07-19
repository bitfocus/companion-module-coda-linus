import { combineRgb } from '@companion-module/base'

export function updatePresets() {
	let presets = {}

	presets['standby'] = {
		type: 'button',
		category: 'Power',
		name: 'Stanby',
		style: {
			text: 'Standby',
			size: '24',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'standby',
						options: {
							standbyState: true,
						},
					},
				],
				up: [],
			},
			{
				down: [
					{
						actionId: 'standby',
						options: {
							standbyState: false,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['muteAll'] = {
		type: 'button',
		category: 'Audio',
		name: 'Mute All',
		style: {
			text: 'Mute All',
			size: '24',
			bgcolor: combineRgb(0, 0, 0),
			color: combineRgb(255, 255, 255),
		},
		steps: [
			{
				down: [
					{
						actionId: 'muteAll',
						options: {
							muteState: true,
						},
					},
				],
				up: [],
			},
			{
				down: [
					{
						actionId: 'muteAll',
						options: {
							muteState: false,
						},
					},
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	this.setPresetDefinitions(presets)
}
