
import {Injectable} from 'angular2/core';


@Injectable()
export class User {

    // User name
    username: string;
    // AaribaScript user settings.
    aaribaScriptSettings: AaribaScriptSettings;

    static default(): User {
        let user = new User();
        user.username = 'Ooops!!';
        user.aaribaScriptSettings = AaribaScriptSettings.default();
        return user;
    }
}

export class AaribaScriptSettings {
    // Font size in pixel
    fontSize: number;
    // Show invisibles
    showInvisibles: boolean;

    static default(): AaribaScriptSettings {
        let settings = new AaribaScriptSettings();
        settings.fontSize = 24;
        settings.showInvisibles = true;
        return settings;
    }
}
