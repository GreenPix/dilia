import {Types} from 'mongoose';
import * as _ from 'lodash';

export enum ResourceKind {
    AaribaScript,
}

export interface Resource {
    owner: Types.ObjectId;
    resource: string;
    timestamp: number;
}

// 2 minutes
const RESOURCE_LIFETIME = 2 * 60 * 1000;

class ResourceManager {
    resources: {[kind: number]: Array<Resource>};


    constructor() {
        this.resources = {
            [ResourceKind.AaribaScript]: []
        };
    }

    isUsedBySomeoneOtherThanMe(arg: {
        resource: string;
        kind: ResourceKind;
        me: Types.ObjectId;
    }): boolean {
        let res = this.getResource(arg.resource, arg.kind);
        if (!res) return false;
        return !res.owner.equals(arg.me);
    }

    lockThisResource(arg: {
        owner: Types.ObjectId;
        kind: ResourceKind;
        resource: string;
    }): boolean {
        // Find the resource with the same id.
        let res = this.getResource(arg.resource, arg.kind);
        // If we didn't find any, then we can
        // lock that resource
        if (!res) {
            this.resources[arg.kind].push({
                owner: arg.owner,
                resource: arg.resource,
                timestamp: Date.now()
            });
            return true;
        }
        // If there's one, it means the resource is locked
        // is the owner the caller?
        if (res.owner.equals(arg.owner)) {
            res.timestamp = Date.now();
            return true;
        }
        return false;
    }

    maintainLockOnResource(arg: {
        owner: Types.ObjectId;
        kind: ResourceKind;
        resource: string;
    }): void {
        let res = this.getResource(arg.resource, arg.kind);
        if (res && res.owner.equals(arg.owner)) {
            res.timestamp = Date.now();
        }
    }

    isUsedByMe(arg: {
        owner: Types.ObjectId;
        kind: ResourceKind;
        resource: string;
    }): boolean {
        let res = this.getResource(arg.resource, arg.kind);
        return res && res.owner.equals(arg.owner);
    }

    updateLockOnResources() {
        let now = Date.now();
        _.forEach(this.resources, (val: Resource[], key) => {
            _.remove(val, res => now - res.timestamp > RESOURCE_LIFETIME);
        });
    }

    private getResource(resource: string, kind: ResourceKind): Resource {
        return _.filter(this.resources[kind], r => r.resource === resource)[0];
    }
}

export var accessControlManager = new ResourceManager();
