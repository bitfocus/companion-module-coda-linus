import { combineRgb } from '@companion-module/base'

export function updatePresets() {
	let presets = {}

	presets['standby'] = {
		type: 'button',
		category: 'Power',
		name: 'Standby',
		style: {
			text: 'Standby',
			size: '14',
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
		feedbacks: [
			{
				feedbackId: 'standbyFeedback',
				options: {
					feedbackStandbyState: true,
				},
				style: {
					bgcolor: combineRgb(0, 128, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
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
		feedbacks: [
			{
				feedbackId: 'muteAllFeedback',
				options: {},
				style: {
					bgcolor: combineRgb(0, 128, 0),
					color: combineRgb(255, 255, 255),
				},
			},
		],
	}

	this.setPresetDefinitions(presets)
}
