import { exec, ExecException } from 'child_process'

export class Commander {
	public static exec(arg: string): Promise<string> {
		return new Promise((resolve, reject) => {
			exec(
				arg,
				(error: ExecException | null, stdout: string, stderr: string): void => {
					if (stdout) {
						resolve(stdout)
						return
					}
					if (stderr) {
						reject(stderr)
						return
					}
					if (error) {
						reject(error + '')
						return
					}
				}
			)
		})
	}
}
