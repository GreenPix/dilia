
type Res = [RegExp, Array<string>];

export interface ApiParams {
    [param_name: string]: string;
}

export interface ApiResolved<F extends Function> {
    params: ApiParams;
    cb: F;
}

export class Router<F extends Function> {

    private apicalls: Array<[RegExp, Array<string>, F]> = [];

    addRoute(apicall_template: string, cb: F) {
        let [regex, params] = this.asRegex(apicall_template);
        this.apicalls.push([regex, params, cb]);
    }

    private asRegex(apicall_template: string): Res {
        // An api call template is of the form:
        //
        //      /api/path/to/:param1/sdf/:param2
        //
        let api_splitted = apicall_template.split(':');
        let regex = api_splitted[0];
        let params: Array<string> = [];
        for (let i = 1; i < api_splitted.length; ++i) {
            let el = api_splitted[i];
            let slash_i = el.indexOf('/');
            regex += '([^\/]*)';
            if (slash_i > 0) {
                params.push(el.slice(0, slash_i));
                el = el.slice(slash_i);
                regex += el;
            } else {
                params.push(el);
            }
        }
        return [new RegExp(regex), params];
    }

    resolve(apicall: string): ApiResolved<F> {

        for (let [api, params, cb] of this.apicalls) {

            let test = api.exec(apicall);
            // Matches has failed this is not the correct API call.
            if (!test) {
                continue;
            }
            // Collect all params;
            let params_found: ApiParams = {};
            for (let i = 1; i < test.length; ++i) {
                let param_name = params[i - 1];
                let matched_value = test[i];
                if (!param_name) {
                    throw new Error(`BUG Found ! ${i}${test}${params}`);
                }
                params_found[param_name] = matched_value;
            }
            return {
                params: params_found,
                cb: cb
            };
        }
        return null;
    }
}
