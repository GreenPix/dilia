import {warn} from 'winston';

export function check() {
    if (['development', 'production', 'test'].indexOf(process.env.NODE_ENV) == -1) {
        /* tslint:disable:quotemark */
        throw new Error("NODE_ENV wasn't set ! Should be either 'development' | 'production' | 'test'");
        /* tslint:enable:quotemark */
    }
    checkToken('GOOGLE_CLIENTID');
    checkToken('GOOGLE_SECRET');
    checkToken('GITHUB_CLIENTID');
    checkToken('GITHUB_SECRET');
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
