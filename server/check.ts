import {warn} from 'winston';

export function check() {
    if (['development', 'production', 'test'].indexOf(process.env.NODE_ENV) == -1) {
        process.env.NODE_ENV = 'production';
    }
    checkToken('GOOGLE_CLIENTID');
    checkToken('GOOGLE_SECRET');
    checkToken('GITHUB_CLIENTID');
    checkToken('GITHUB_SECRET');

    if (!process.env.DILIA_WEBSITE && process.env.NODE_ENV == 'production') {
        throw new Error('DILIA_WEBSITE is not defined (http(s?)://<hostname>)');
    }
}

function checkToken(token) {
    let msg = `${token} was not defined:` +
    `\tAuthentication using this provider are going to fails...`;

    if (!process.env[token]) {
        if (process.env.NODE_ENV !== 'production') {
            warn(msg);
            process.env[token] = `FAKE_${token}`;
        } else {
            throw new Error(msg);
        }
    }
}
