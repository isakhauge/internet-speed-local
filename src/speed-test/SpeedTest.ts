import path from 'path'
import { createLogger, Logger, transports, config } from 'winston'
import axios, { AxiosResponse } from 'axios'
import { Commander } from '../lib/commander/Commander'
import { SpeedTestResult } from '../lib/ookla-speedtest/SpeedTest'
import dotenv from 'dotenv'
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
		let axiosResponse: AxiosResponse

		try {
			rawStr = await Commander.exec(arg)
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Executing speedtest CLI command',
				message: e + '',
				reason: e,
			})
			return
		}

		try {
			result = JSON.parse(rawStr) as SpeedTestResult
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Parsing test result to JSON',
				message: e + '',
				reason: e,
			})
			return
		}

		try {
			axiosResponse = await this.storeSpeedTestResult(result)
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				context: 'Sending test result to API',
				message: e + '',
				reason: e,
			})
			return
		}

		this.logger.log('info', {
			timestamp: new Date().toISOString(),
			down: SpeedTest.toMbpsString(result.download.bandwidth),
			up: SpeedTest.toMbpsString(result.upload.bandwidth),
			axios: axiosResponse,
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

	private storeSpeedTestResult(data: SpeedTestResult): Promise<AxiosResponse> {
		return new Promise((resolve, reject) => {
			axios
				.post(SpeedTest.storeUrl, data)
				.then((response: AxiosResponse) => {
					resolve(response)
				})
				.catch((reason: any) => {
					reject(reason)
				})
		})
	}

	private static toMbpsString(arg: number): string {
		return (arg / 125_000).toFixed(2) + ' Mbps'
	}
}

export default SpeedTest
