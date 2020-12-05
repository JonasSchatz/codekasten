import * as path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const extensionTestsPath = path.resolve(__dirname, './suite/index');
        const testWorkspace: string = path.resolve(__dirname, './../../src/test/fixture');
		await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [testWorkspace]});
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
