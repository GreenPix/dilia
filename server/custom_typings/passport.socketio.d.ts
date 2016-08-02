declare module 'passport.socketio' {

    interface AuthorizeSuccess {
        (data: any, accept: () => void): void;
    }

    interface AuthorizeFail {
        (data: any, message: string, error: any, accept: (err: any) => void): void;
    }

    export function authorize(arg: {
        cookieParser: any,          // the same middleware you registrer in express
        key:          string,       // the name of the cookie where express/connect stores its session_id
        secret:       string,       // the session_secret to parse the cookie
        store:        any,          // we NEED to use a sessionstore. no memorystore please
        success?:     AuthorizeSuccess,  // *optional* callback on success - read more below
        fail?:        AuthorizeFail,     // *optional* callback on fail/error - read mo
    }): any;
}
