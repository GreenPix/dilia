
export const port = 8000;
// Limit set to 20mb
export const max_file_size = 20 * 1024 * 1024; // in bytes

const configDev: Config = {
    mongodb: 'mongodb://localhost/diliaDev',
    github: {
      clientID: process.env.GITHUB_CLIENTID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: `http://localhost:${port}/api/login/github/callback`
    },
    google: {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `http://localhost:${port}/api/login/google/callback`
    },
};

const configProd: Config = {
    mongodb: 'mongodb://localhost/dilia',
    github: {
      clientID: process.env.GITHUB_CLIENTID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: `${process.env.DILIA_WEBSITE}/api/login/github/callback`
    },
    google: {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: `${process.env.DILIA_WEBSITE}/api/login/google/callback`
    },
};

export const development = configDev;
export const production = configProd;

export function config(): Config {
    if (process.env.NODE_ENV === 'production') {
        return configProd;
    }
    if (process.env.NODE_ENV === 'test') {
        // TODO: Prepare test environment
        return null;
    }
    return configDev;
}

interface StrategySettings {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
}

interface Config {
    mongodb: string;
    github: StrategySettings;
    google: StrategySettings;
}
