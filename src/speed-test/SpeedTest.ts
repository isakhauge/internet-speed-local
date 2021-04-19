import path from 'path'
import { createLogger, Logger, transports, config } from 'winston'
import axios, { AxiosResponse } from 'axios'
import { Commander } from '../lib/commander/Commander'
import { SpeedTestResult } from '../lib/ookla-speedtest/SpeedTest'

class SpeedTest {
	private static readonly binaryName = 'speedtest'
	private static readonly unitFlag = '-u'
	private static readonly unitFormat = 'Mbps'
	private static readonly outputFormatFlag = '-f'
	private static readonly outputFormat = 'json-pretty'

	private static readonly storeUrl =
		'https://internet-speed-isakhauge.herokuapp.com/api/speedtest'

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

		try {
			rawStr = await Commander.exec(arg)
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				message: 'Error occured when running the speedtest command',
				reason: e,
			})
			return
		}

		try {
			result = JSON.parse(rawStr) as SpeedTestResult
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				message: 'Error occured when parsing the raw string to JSON',
				reason: e,
			})
			return
		}

		try {
			await this.storeSpeedTestResult(result)
		} catch (e) {
			this.logger.log('error', {
				timestamp: new Date().toISOString(),
				message: 'An error occured when sending the request to API',
				reason: e,
			})
			return
		}

		this.logger.log('info', {
			timestamp: new Date().toISOString(),
			down: SpeedTest.toMbpsString(result.download.bandwidth),
			up: SpeedTest.toMbpsString(result.upload.bandwidth),
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

	private storeSpeedTestResult(data: SpeedTestResult) {
		return new Promise((resolve, reject) => {
			axios
				.post(SpeedTest.storeUrl, data)
				.then((response: AxiosResponse) => {
					resolve(response.data)
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
