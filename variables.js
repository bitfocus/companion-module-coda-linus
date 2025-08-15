export function updateVariables() {
	let variables = [
		{
			name: 'Hardware address',
			variableId: 'hw_addr',
		},
		{
			name: 'IP address',
			variableId: 'ip_addr',
		},
		{
			name: 'IP mask',
			variableId: 'ip_mask',
		},
		{
			name: 'Model',
			variableId: 'model',
		},
		{
			name: 'Serial',
			variableId: 'serial',
		},
		{
			name: 'Software version',
			variableId: 'sw_version',
		},
		{
			name: 'Hardware version',
			variableId: 'hw_version',
		},
		{
			name: 'Description',
			variableId: 'desc',
		},
	]
	this.setVariableDefinitions(variables)
}
