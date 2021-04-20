import {
	request as httpReq,
	RequestOptions,
	IncomingMessage,
	ClientRequest,
} from 'http'
import { request as httpsReq } from 'https'

export class HttpsWrapper {
	public static post(url: string, data: object): Promise<Buffer> {
		const stringifiedData = JSON.stringify(data)
		const isHttps = /^https:/.test(url)
		return new Promise((resolve, reject) => {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': stringifiedData.length,
				},
			} as RequestOptions

			const callback = (res: IncomingMessage) => {
				res.on('data', resolve)
				res.on('error', reject)
			}
			const req = (() => {
				return isHttps
					? httpsReq(url, options, callback)
					: httpReq(url, options, callback)
			})() as ClientRequest
			req.write(stringifiedData)
			req.end()
		})
	}
}
