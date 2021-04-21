import {
	request as httpReq,
	RequestOptions,
	IncomingMessage,
	ClientRequest,
} from 'http'
import { request as httpsReq } from 'https'

type RequestCallback = (res: IncomingMessage) => void

export class HttpsWrapper {
	public static post(url: string, data: string): Promise<string> {
		const options = HttpsWrapper.createRequestOptions(data.length)
		return new Promise((resolve, reject) => {
			const request = HttpsWrapper.createRequest(
				url,
				options,
				(res: IncomingMessage) => {
					res.on('data', (chunk: Buffer) => {
						resolve(chunk.toString())
					})
					res.on('error', reject)
				}
			)
			request.write(data)
			request.end()
		})
	}

	public static createRequestOptions(dataLength: number): RequestOptions {
		return {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': dataLength,
			},
		}
	}

	public static createRequest(
		url: string,
		options: RequestOptions,
		callback: RequestCallback
	): ClientRequest {
		const isHttps = /^https:/.test(url)
		if (isHttps) {
			return httpsReq(url, options, callback)
		}
		return httpReq(url, options, callback)
	}
}
