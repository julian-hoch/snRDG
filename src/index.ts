#!/usr/bin/env node

//
// Standard libraries
//
import chalk from 'chalk';
import yargs, { Argv } from "yargs";
import Spinnies from 'spinnies';
const sp = new Spinnies();

//
// Module dependencies
//
import ServiceNowInstance from './instance';
import CodeGenerator from './codeGenerator';
import { TableSchema } from './schema';
import { RowDataGateway } from './rdg';

//
// Load configuration
//
import 'dotenv/config';

//
// Helper functions
//

/**
 * Get an instance of the ServiceNowInstance class using the configuration
 * from the environment.
 *
 * @returns {ServiceNowInstance} configured instance
 */
function getInstance() {
    const instanceHostname = process?.env?.SNRDG_INSTANCE;
    if (!instanceHostname) {
	console.error('Instance hostname not set. Make sure SNRDG_INSTANCE is set in the environment or in the .env file');
	process.exit(1);
    }

    const apiKey = process?.env?.SNRDG_API_KEY;
    if (!apiKey) {
	console.error('API key not set. Make sure SNRDG_API_KEY is set in the environment or in the .env file');
	process.exit(1);
    }

    const instance = new ServiceNowInstance(instanceHostname, apiKey);
    return instance;
}

//
// Argument parsing
//

console.debug = () => void 0;

yargs(process.argv.slice(2))
    .usage('Usage: $0 <cmd> [args]')
    .option('debug', {
        alias: 'd',
        type: 'boolean',
        description: 'Enable debug output',
    })
    .option('silent', {
        alias: 's',
        type: 'boolean',
        description: 'Silent mode, minimal output',
    })
    .check((argv) => {
        if (argv.debug) {
            console.debug = (...args: unknown[]) => console.log(chalk.blueBright('DEBUG:'), ...args);
            console.debug('Debug output enabled');
        }
        if (argv.silent) {
            sp.add = () => void 0;
            sp.succeed = () => void 0;
            sp.fail = () => void 0;
        }
        return true;
    })
    .command('test', 'Test access to instance', ()  => undefined, async () => {
	console.debug('Testing access to instance');

	sp.add('snrdg-test', {
	    text: 'Testing access to instance',
	});

	const instance = getInstance();
	const success = await instance.test();
	
	if (!success) {
	    sp.fail('snrdg-test');
	    console.error('Test failed');
	    process.exit(1);
	}

	sp.succeed('snrdg-test');
	console.log('Test successful');
    })
    .command(
        'schema <table>',
        'get the schema of a table as JSON',
        (yargs) => {
            yargs.positional(chalk.yellow('table'), {
                type: 'string',
                describe: 'table name',
                demandOption: true,
            });
        },
        async (argv) => {

	    sp.add('snrdg-get-schema', {
		text: `Retrieving table schema for ${argv.table}`,
	    });

	    const instance = getInstance();

	    try {
		const schema = await instance.getSchema(argv.table as string);
		sp.succeed('snrdg-get-schema');
		console.log(JSON.stringify(schema, null, 2));
	    } catch (e) {
		sp.fail('snrdg-get-schema');
		console.debug(e);
		process.exit(1);
	    }
        }
    )
    .command(
	'generate <table> <className> [template]',
	'creates row data gateway class for a given ServiceNow table',
	(yargs) => {
            yargs.positional(chalk.yellow('table'), {
                type: 'string',
                describe: 'table name',
                demandOption: true,
            });
            yargs.positional(chalk.yellow('className'), {
                type: 'string',
                describe: 'name of the class',
                demandOption: true,
            });
	    yargs.positional(chalk.yellow('template'), {
		type: 'string',
		describe: 'template to use for class generation',
		default: 'class_es5',
	    });
        },
        async (argv) => {
            const tableName = argv.table as string;
            const className = argv.className as string;
	    const template = argv.template as string;

	    sp.add('snrdg-get-schema', {
		text: `Retrieving table schema for ${argv.table}`,
	    });

	    const instance = getInstance();
	    let schema: TableSchema;

	    try {
		schema = await instance.getSchema(argv.table as string);
		sp.succeed('snrdg-get-schema');
	    } catch (e) {
		sp.fail('snrdg-get-schema');
		console.debug(e);
		process.exit(1);
	    }

	    sp.add('snrdg-generate', {
		text: `Generating class for ${tableName} as ${className}`,
	    });

	    try {
		// create object containing class metadata from table schema
		const rdgClass = new RowDataGateway(tableName, className, schema);

		// generate class code from template
		const code = await CodeGenerator.generateClass(rdgClass, template);
		sp.succeed('snrdg-generate');

		// output generated code to stdout 
		console.log(code);
	    } catch (e) {
		sp.fail('snrdg-generate');
		console.warn(e);
		process.exit(1);
	    }
        }
    )
    .help()
    .demandCommand()
    .alias('h', 'help')
    .alias('v', 'version')
    .strict()
    .completion()
    .argv;
