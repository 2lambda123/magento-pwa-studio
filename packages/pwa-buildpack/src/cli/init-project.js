const { resolve } = require('path');
const fetch = require('node-fetch');
const os = require('os');
const isValidNpmName = require('is-valid-npm-name');
const tar = require('tar');
const camelspace = require('camelspace');
const fse = require('fs-extra');
const prettyLogger = require('../util/pretty-logger');
const createProject = require('../Utilities/createProject');
const { handler: initCustomOrigin } = require('./init-custom-origin');
const { handler: createEnvFile } = require('./create-env-file');
const execa = require('execa');

const tmpDir = os.tmpdir();

const templateAliases = {
    'venia-starter': {
        npm: '@magento/venia-concept',
        dir: resolve(__dirname, '../../../venia-concept')
    }
};

async function makeDirFromNpmPackage(packageName) {
    const nameCheck = isValidNpmName(packageName);
    if (typeof nameCheck === 'string') {
        throw new Error(
            `Invalid template: interpreted "${packageName}" as NPM package, which was invalid for the following reasons:\n${nameCheck}`
        );
    }
    const packageDir = resolve(tmpDir, packageName);
    // NPM extracts a tarball to './package'
    const packageRoot = resolve(packageDir, 'package');
    try {
        if ((await fse.readdir(packageRoot)).includes('package.json')) {
            prettyLogger.info(`Found ${packageName} template in cache`);
            return packageRoot;
        }
    } catch (e) {
        // Not cached.
    }
    let tarballUrl;
    try {
        prettyLogger.info(`Finding ${packageName} tarball on NPM`);
        tarballUrl = JSON.parse(
            execa.shellSync(`npm view --json ${packageName}`, {
                encoding: 'utf-8'
            }).stdout
        ).dist.tarball;
    } catch (e) {
        throw new Error(
            `Invalid template: could not get tarball url from npm: ${e.message}`
        );
    }

    let tarballStream;
    try {
        prettyLogger.info(`Downloading and unpacking ${tarballUrl}`);
        tarballStream = (await fetch(tarballUrl)).body;
    } catch (e) {
        throw new Error(
            `Invalid template: could not download tarball from NPM: ${
                e.message
            }`
        );
    }

    await fse.ensureDir(packageDir);
    return new Promise((res, rej) => {
        const untarStream = tar.extract({
            cwd: packageDir
        });
        tarballStream.pipe(untarStream);
        untarStream.on('finish', () => {
            prettyLogger.info(`Unpacked ${packageName}`);
            res(packageRoot);
        });
        untarStream.on('error', rej);
        tarballStream.on('error', rej);
    });
}

async function findTemplateDir(templateName) {
    const template = templateAliases[templateName] || {
        npm: templateName,
        dir: templateName
    };
    try {
        await fse.readdir(template.dir);
        prettyLogger.info(`Found ${templateName} directory`);
        // if that succeeded, then...
        return template.dir;
    } catch (e) {
        prettyLogger.info(`No template at ${template.dir}.`);
        return makeDirFromNpmPackage(template.npm);
    }
}

module.exports.sampleBackends = require('../../sampleBackends.json');

module.exports.command = 'init-project <template> <directory>';

module.exports.describe =
    'Create a PWA project in <directory> based on <template>.';

module.exports.builder = yargs =>
    yargs
        .version()
        .showHelpOnFail(false)
        .positional('template', {
            describe:
                'Name of a "template" to clone and customize. Currently the "venia-starter" template is supported: `buildpack init-project venia-starter <directory>',
            choices: ['venia-starter']
        })
        .positional('directory', {
            describe:
                'Name or path to a directory to create and fill with the project files. This directory will be the project root.',
            normalize: true
        })
        .group(['backendUrl', 'customOrigin'], 'Project configuration:')
        .options({
            backendUrl: {
                alias: 'b',
                describe:
                    'URL of the Magento 2.3 instance to use as a backend. Will be added to `.env` file.'
            },
            customOrigin: {
                boolean: true,
                describe:
                    'Create a custom secure host and certificate for this project. Required for full PWA functionality. Requires administrator privileges.',
                default: true
            }
        })
        .group(['name', 'author'], 'Metadata:')
        .options({
            name: {
                alias: 'n',
                describe:
                    'Short name of the project to put in the package.json "name" field. Uses <directory> by default.'
            },
            author: {
                alias: 'a',
                describe:
                    'Name and (optionally <email address>) of the author to put in the package.json "author" field.'
            }
        })
        .group(['install', 'npmClient'], 'Package management:')
        .options({
            install: {
                boolean: true,
                describe: 'Install package dependencies after creating project',
                default: true
            },
            npmClient: {
                describe: 'NPM package management client to use.',
                choices: ['npm', 'yarn'],
                default: 'npm'
            }
        })
        .help();

module.exports.handler = async function buildpackCli(argv) {
    const params = {
        ...argv,
        name: argv.name || argv.directory,
        template: await findTemplateDir(argv.template)
    };
    const { directory, name } = params;
    await fse.ensureDir(directory);
    prettyLogger.info(`Creating a new PWA project '${name}' in ${directory}`);
    await createProject(params);
    prettyLogger.success(`Created new PWA project ${directory}`);

    if (params.backendUrl) {
        const magentoNS = camelspace('magento');
        const { backendUrl } = magentoNS.fromEnv(process.env);
        if (backendUrl && backendUrl !== params.backendUrl) {
            prettyLogger.warn(
                `Command line option --backend-url was set to '${
                    params.backendUrl
                }', but environment variable ${JSON.stringify(
                    magentoNS.toEnv({ backendUrl })
                )} conflicts with it. Environment variable overrides!`
            );
        } else {
            Object.assign(
                process.env,
                magentoNS.toEnv({ backendUrl: params.backendUrl })
            );
        }
    }

    createEnvFile({ directory });
    if (params.customOrigin) {
        await initCustomOrigin({ directory });
        prettyLogger.success(
            `Created custom secure domain for '${name}' project`
        );
    }
    if (params.install) {
        await execa.shell(`${params.npmClient} install`, {
            cwd: directory,
            stdio: 'inherit'
        });
        prettyLogger.success(`Installed dependencies for '${name}' project`);
    }
};
