import {Types} from 'mongoose';
import * as _ from 'lodash';

export enum ResourceKind {
    AaribaScript,
}

export interface Resource {
    owner: Types.ObjectId;
    resource: Types.ObjectId;
}

class ResourceManager {
    resources: {[kind: number]: Array<Resource>};

    constructor() {
        this.resources = {
            [ResourceKind.AaribaScript]: []
        };
    }



    isUsedBy(res: {
        owner: Types.ObjectId;
        kind: ResourceKind;
        resource: Types.ObjectId;
    }): boolean {
        return _.some(this.resources[res.kind], r =>
            r.resource.equals(res.resource) && r.owner.equals(res.owner)
        );
    }
}

export var resourceManager = new ResourceManager();
