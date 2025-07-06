import { spawn } from 'child_process';
import path from 'path';

export function runSQLWithInterpreter(sql: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const interpreterPath = path.resolve(__dirname, '../../../interpreter/interpreter.py');
        const child = spawn('python', [interpreterPath]);

        let output = '';
        let error = '';

        child.stdout.on('data', (data: Buffer) => {
            output += data.toString();
        });

        child.stderr.on('data', (data: Buffer) => {
            error += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0 || error) {
                return reject(new Error(error || 'Interpreter exited with non-zero code'));
            }

            const cleaned = output
                .split('\n')
                .map(line => line.replace(/^sql>\s*/, '').trim())
                .filter(line => line !== '')
                .join('\n');

            resolve(cleaned.trim());
        });

        child.stdin.write(sql + '\n');
        child.stdin.write('exit\n');
        child.stdin.end();
    });
}
