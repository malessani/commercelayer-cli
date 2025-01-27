import Command, { filterApplications, Flags, cliux } from '../../base'
import {configParam, ConfigParams } from '../../config'
import { printScope } from '../../common'
import { AppInfo, clApplication, clOutput, clUtil, clColor } from '@commercelayer/cli-core'


export default class ApplicationsIndex extends Command {

	static description = 'show a list of all (logged in) available CLI applications'

	static aliases = ['app:list', 'applications:list', 'app:available', 'applications:available', 'apps']

	static examples = [
		'$ commercelayer applications',
		'$ cl applications',
	]

	static flags = {
		...Command.flags,
		extra: Flags.boolean({
			char: 'X',
			description: 'show applications extra info',
			hidden: true,
		}),
	}

	static args = []

	async run() {

		const { flags } = await this.parse(ApplicationsIndex)

		let configData: AppInfo[]
		try {
			configData = filterApplications(this.config, flags)
		} catch (error) {
			this.error('No application config file found', { suggestions: ['Execute first login to at least one Commerce Layer application'] })
		}

		const current = configParam(ConfigParams.currentApplication)
		const currentChar = '\u25C9'

		this.log()
		if (configData.length > 0) {

			const currentVisibile = configData.some(a => clApplication.appKeyMatch(current, a))

			cliux.Table.table(configData as any, {
				current: { header: `[${currentChar}]`, minWidth: 3, get: row => clApplication.appKeyMatch(current, row as unknown as AppInfo) ? clColor.magentaBright(` ${currentChar} `) : '   ' },
				organization: { header: 'ORGANIZATION', get: row => currentColor(row, current)(row.organization) },
				slug: { header: 'SLUG', get: row => currentColor(row, current)(row.slug) },
				name: { header: 'APPLICATION', get: row => currentColor(row, current)(row.name) },
				id: { header: 'ID', get: row => currentColor(row, current)(row.id)},
				kind: { header: 'KIND', get: row => currentColor(row, current)(row.kind) },
				scope: { header: 'SCOPE', minWidth: 10, get: row => currentColor(row, current)(printScope(row.scope as string)) },
				customer: { header: 'PWD', get: row => (row.email && row.password) ? clColor.cyanBright(clOutput.center('\u221A', 'PWD'.length)) : '' },
				mode: { header: 'MODE', get: row => `${((row.mode === 'live') ? clColor.api.live : clColor.api.test)(row.mode)}` },
				alias: { header: 'ALIAS', get: row => clColor.cli.alias(row.alias || '') },
				...extraColumns(flags),
			}, {
				printLine: clUtil.log,
			})

			if (current && currentVisibile) this.log(clColor.italic.magentaBright(`\n(${currentChar}) Current application`))

		} else this.log(clColor.italic('No application found'))

		this.log()

	}

}


const extraColumns = (flags: any): any => {
	const extra: any = {}
	if (flags.extra) {
		extra.appkey = { header: clColor.dim('APPKEY'), get: (row: { key: any }) => clColor.dim(row.key || '') }
		extra.domain = { header: clColor.dim('   DOMAIN'), get: (row: { domain: any }) => clColor.dim(row.domain || '') }
	}
	return extra
}


const currentColor = (app: any, current: any): Function => {
	return (clApplication.appKeyMatch(current, app) ? clColor.magentaBright : clColor.visible)
}

