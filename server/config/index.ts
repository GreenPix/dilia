
export var port = 8000;
export var max_file_size = 5 * 1024 * 1024; // in bytes

let configDev: Config = {
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

let configProd: Config = {
    mongodb: 'mongodb://localhost/dilia',
    github: {
      clientID: process.env.GITHUB_CLIENTID,
      clientSecret: process.env.GITHUB_SECRET,
      callbackURL: 'http://dilia.herokuapp.com/api/login/github/callback'
    },
    google: {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: 'http://dilia.herokuapp.com/api/login/google/callback'
    },
};

export var development = configDev;
export var production = configProd;

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
