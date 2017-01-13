declare module 'scrypt' {

    interface ErrorCallback<O> {
        (err: any, obj: O): void;
    }

    interface ParamsObject {}

    export function params(maxtime: number, maxmem?: number, max_memefrac?: number, cb?: ErrorCallback<ParamsObject>): void;
    export function params(maxtime: number, maxmem?: number, max_memefrac?: number): Promise<ParamsObject>;
    export function paramsSync(maxtime: number, maxmem?: number, max_memefrac?: number): ParamsObject;

    export function verifyKdf(kdf: Buffer, key: string | Buffer, cb: ErrorCallback<boolean>): void;
    export function verifyKdf(kdf: Buffer, key: string | Buffer): Promise<boolean>;
    export function verifyKdfSync(kdf: Buffer, key: string | Buffer): boolean;

    export function kdf(key: string | Buffer, paramsObject: ParamsObject, cb: ErrorCallback<Buffer>): void;
    export function kdf(key: string | Buffer, paramsObject: ParamsObject): Promise<Buffer>;
    export function kdfSync(key: string | Buffer, paramsObject: ParamsObject): Buffer;

    export function hash(key: string | Buffer, paramsObject: ParamsObject, output_length: number, salt: string | Buffer, cb: ErrorCallback<Buffer>): void;
    export function hash(key: string | Buffer, paramsObject: ParamsObject, output_length: number, salt: string | Buffer): Promise<Buffer>;
    export function hashSync(key: string | Buffer, paramsObject: ParamsObject, output_length: number, salt: string | Buffer): Buffer;
}
