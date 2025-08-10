import { combineRgb } from '@companion-module/base'

export function updateFeedbacks() {
	let feedbacks = {}

	feedbacks['standbyFeedback'] = {
		type: 'boolean',
		name: 'Amplifier Standby Status',
		description: 'Indicates amplifier standby state',
		defaultSyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 204, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Standby State',
				id: 'feedbackStandbyState',
				default: true,
				choices: [
					{ id: true, label: 'Enabled' },
					{ id: false, label: 'Disabled' },
				],
			},
		],
		callback: ({ options }) => {
			if (this.standbyState === options.feedbackStandbyState) {
				return true
			} else {
				return false
			}
		},
	}

	feedbacks['muteFeedback'] = {
		type: 'boolean',
		name: 'Channel Mute Status',
		description: 'Indicates channel mute state',
		defaultSyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 204, 0),
		},
		options: [
			{
				type: 'dropdown',
				label: 'Channel',
				id: 'feedbackMuteChannel',
				default: '1',
				choices: [
					{ id: '1', label: '1' },
					{ id: '2', label: '2' },
					{ id: '3', label: '3' },
					{ id: '4', label: '4' },
				],
			},
			{
				type: 'dropdown',
				label: 'Channel',
				id: 'feedbackMuteState',
				default: true,
				choices: [
					{ id: true, label: 'Enabled' },
					{ id: false, label: 'Disabled' },
				],
			},
		],
		callback: ({ options }) => {
			if (this.muteState[options.feedbackMuteChannel] === options.feedbackMuteState) {
				return true
			} else {
				return false
			}
		},
	}

	this.setFeedbackDefinitions(feedbacks)
}
