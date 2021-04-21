import path from 'path'
import { createLogger, Logger, transports, config } from 'winston'
import { Commander } from '../lib/commander/Commander'
import { SpeedTestResult } from '../lib/ookla-speedtest/SpeedTest'
import dotenv from 'dotenv'
import { cout } from '../lib/cout/Cout'
import { HttpsWrapper } from '../lib/https-wrapper/HttpsWrapper'
dotenv.config()

const {
	STORE_URL,
	SPEEDTEST_CLI_UNIT_FORMAT,
	SPEEDTEST_CLI_OUTPUT_FORMAT,
} = process.env

class SpeedTest {
	private static readonly binaryName = 'speedtest'
	private static readonly unitFlag = '-u'
	private static readonly unitFormat = SPEEDTEST_CLI_UNIT_FORMAT
	private static readonly outputFormatFlag = '-f'
	private static readonly outputFormat = SPEEDTEST_CLI_OUTPUT_FORMAT
	private static readonly storeUrl = STORE_URL ?? ''

	private logger: Logger

	public constructor() {
		this.logger = SpeedTest.createLogger()
	}

	private static createLogger(): Logger {
		return createLogger({
			levels: config.syslog.levels,
			transports: [
				new transports.File({
					filename: path.resolve(__dirname, './logs/speedtests.log'),
					level: 'info',
				}),
				new transports.File({
					filename: path.resolve(__dirname, './logs/errors.log'),
					level: 'error',
				}),
			],
		})
	}

	public async run(): Promise<void> {
		const arg = SpeedTest.composeArgument()
		let rawStr: string
		let result: SpeedTestResult
		let response: string

		try {
			cout('Running the SpeedTest CLI ...')
			rawStr = await Commander.exec(arg)
			cout('Raw string output from SpeedTest CLI:', rawStr)
		} catch (e) {
			cout('SpeedTest CLI failed:', e)
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Executing speedtest CLI command',
				message: e + '',
				reason: e,
			})
			return
		}

		try {
			response = await this.storeSpeedTestResult(rawStr)
			cout('HTTP POST Response:', response)
		} catch (e) {
			cout('HTTP POST Request failed:')
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Sending test result to API',
				message: e + '',
				reason: e,
			})
			return
		}

		try {
			result = JSON.parse(rawStr) as SpeedTestResult
			cout('Parsed string to JSON successfully!', {
				down: SpeedTest.toMbpsString(result.download.bandwidth),
				up: SpeedTest.toMbpsString(result.upload.bandwidth),
			})
		} catch (e) {
			cout('JSON parsing', e)
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Parsing test result to JSON',
				message: e + '',
				reason: e,
			})
			return
		}

		this.logger.log('info', {
			timestamp: new Date().toISOString(),
			down: SpeedTest.toMbpsString(result.download.bandwidth),
			up: SpeedTest.toMbpsString(result.upload.bandwidth),
			response: response,
		})
		return
	}

	private static composeArgument(): string {
		return [
			SpeedTest.binaryName,
			SpeedTest.unitFlag,
			SpeedTest.unitFormat,
			SpeedTest.outputFormatFlag,
			SpeedTest.outputFormat,
		].join(' ')
	}

	private async storeSpeedTestResult(data: string): Promise<string> {
		return await HttpsWrapper.post(SpeedTest.storeUrl, data)
	}

	private static toMbpsString(arg: number): string {
		return (arg / 125_000).toFixed(2) + ' Mbps'
	}
}

export default SpeedTest
