import { config } from 'dotenv'
config()

const dev = process.env?.ENV === 'development'

export function cout(...arg: any[]) {
	if (dev) {
		console.log('🐛 Debug:', ...arg)
	}
}
