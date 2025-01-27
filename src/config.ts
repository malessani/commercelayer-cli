import Configstore from 'configstore'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs'
import { Config } from '@oclif/core/lib/interfaces/config'
import type { AppKey, AppInfo } from '@commercelayer/cli-core'

const packageJson = require('../package.json')



const clicfg = new Configstore(packageJson.name, null, { globalConfigPath: true })
export default clicfg


const fixed = {
	applicationsDir: 'applications',
	configSuffix: 'config.json',
	tokenSuffix: 'token.json',
	encoding: 'utf-8' as BufferEncoding,
}


const configDir = (config: Config): string => {
	return join(config.configDir, fixed.applicationsDir)
}

const configDirExists = (config: Config): boolean => {
	return existsSync(configDir(config))
}

const createConfigDir = (config: Config): void => {
	mkdirSync(configDir(config), { recursive: true })
}


const configFilePath = (config: Config, { key }: AppKey): string => {
	return join(configDir(config), `${key}.${fixed.configSuffix}`)
}

const tokenFilePath = (config: Config, { key }: AppKey): string => {
	return join(configDir(config), `${key}.${fixed.tokenSuffix}`)
}


const configFileExists = (config: Config, app: AppKey): boolean => {
	const filePath = configFilePath(config, app)
	return existsSync(filePath)
}

const tokenFileExists = (config: Config, app: AppKey): boolean => {
	const filePath = tokenFilePath(config, app)
	return existsSync(filePath)
}


const writeConfigFile = (config: Config, app: AppInfo): void => {
	const filePath = configFilePath(config, app)
	writeFileSync(filePath, JSON.stringify(app, null, 4))
}

const writeTokenFile = (config: Config, app: AppKey, token: any): void => {
	const filePath = tokenFilePath(config, app)
	writeFileSync(filePath, JSON.stringify(token, null, 4))
}

const readConfigFile = (config: Config, app: AppKey): AppInfo => {
	const filePath = configFilePath(config, app)
	const cliConfig = readFileSync(filePath, { encoding: fixed.encoding })
	return JSON.parse(cliConfig)
}

const readTokenFile = (config: Config, app: AppKey): any => {
	const filePath = tokenFilePath(config, app)
	const token = readFileSync(filePath, { encoding: fixed.encoding })
	return JSON.parse(token)
}

const deleteConfigFile = (config: Config, app: AppKey): boolean => {
	const filePath = configFilePath(config, app)
	unlinkSync(filePath)
	return true
}

const deleteTokenFile = (config: Config, app: AppKey): boolean => {
	const filePath = tokenFilePath(config, app)
	unlinkSync(filePath,)
	return true
}

const readConfigDir = (config: Config, filter: { key?: string }): AppInfo[] => {

	if (!configDirExists(config)) return []

	const files = readdirSync(configDir(config)).map(f => {

		const fc = f.split('.')

		if (fc.length !== 3) return undefined
		if (fc[fc.length - 2] !== 'config') return undefined
		if (fc[fc.length - 1] !== 'json') return undefined

		const key = fc[0]

		if (filter.key && (key !== filter.key)) return undefined

		return { key }

	}).filter(f => f)

	return files.map(f => {
		return readConfigFile(config, f as AppKey)
	})

}


export { createConfigDir, readConfigDir, configDir, configDirExists }
export { configFilePath, configFileExists, writeConfigFile, readConfigFile, deleteConfigFile }
export { tokenFilePath, tokenFileExists, writeTokenFile, readTokenFile, deleteTokenFile }



const currentApplication = (app?: AppInfo): AppInfo | undefined => {
	if (app) clicfg.set(ConfigParams.currentApplication, {
		key: app.key,
		id: app.id,
		name: app.name,
		slug: app.slug,
		domain: app.domain,
		kind: app.kind,
		mode: app.mode,
		organization: app.organization,
		scope: app.scope,
		email: app.email,
		alias: app.alias,
	})
	return clicfg.get(ConfigParams.currentApplication)
}

const currentOrganization = (): string | undefined => {
	const current = clicfg.get(ConfigParams.currentApplication)
	return current?.slug
}


export { currentApplication, currentOrganization }



enum ConfigParams {
	currentApplication = 'currentApplication',
	commandRetention = 'commandRetention',
	applicationTypeCheck = 'applicationTypeCheck',
	defaultDomain = 'defaultDomain',
	test = 'test',
}

enum ConfigParamsEditable {
	test,
	commandRetention
}

const defaultConfig: any = {
	test: 'defaultTestValue',
	commandRetention: 30,	// days of retention
	defaultDomain: 'commercelayer.io',
	applicationTypeCheck: ['cli', 'sales_channel', 'integration'],
}



const paramEditable = (param: ConfigParams): boolean => {
	return (Object.keys(ConfigParamsEditable).includes(param))
}

const paramExists = (param: string): boolean => {
	return (Object.keys(ConfigParams).includes(param))
}

const paramDefault = (param: ConfigParamsEditable) => {
	return defaultConfig[param]
}

const configParam = (param: ConfigParams, value?: any): any => {
	if (value) {
		if (!paramEditable(param)) throw new Error(`Parameter ${param} is not editable`)
		clicfg.set(param, value)
	}
	return clicfg.get(param) || paramDefault(param as unknown as ConfigParamsEditable)
}


export { ConfigParams, ConfigParamsEditable }
export { configParam, paramEditable, paramExists, paramDefault }
