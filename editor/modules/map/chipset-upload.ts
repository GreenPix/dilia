import {Component} from '@angular/core';
import {ViewChild} from '@angular/core';
import * as uniqueId from 'lodash/uniqueId';
import * as isString from 'lodash/isString';
import * as values from 'lodash/values';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Dialog} from '../../components';
import {ChipsetMaxFileSize} from '../../../shared/map';

const chipsetUploadCss = require<Webpack.Scss>('./chipset-upload.scss');
const XSSI_PREFIX = /^\)\]\}',?\n/;

enum ImgState {
    Nothing = 0,
    LoadingImg = 1,
    ImgPresent = 2,
}

@Component({
    selector: 'chipset-modal',
    styles: [chipsetUploadCss.toString()],
    template: `
        <dialog-modal [onHide]="_rd" #upload>
            <dialog-header>Edit a chipset</dialog-header>
            <dialog-body>
                <div class="alert alert-danger" *ngIf="error_message !== ''">
                    <span class="control-label">{{error_message}}</span>
                </div>
                <upload [fileChange]="_fc" *ngIf="img_state == 0"></upload>
                <div class="img-area" [ngClass]="{'uploading': uploading}">
                    <img id={{id}} [ngClass]="{'hidden': img_state != 2 }"/>
                    <div class="upload-bar">
                        <div class="subbar">{{percentage_upload.toFixed(0) +'%'}}</div>
                    </div>
                </div>
                <label for="chipset-name" class="control-label">Chipset Name</label>
                <input [(ngModel)]="chipset_name"
                    type="text" class="form-control"
                    id="chipset-name"
                    [disabled]="uploading"
                    placeholder="Chipset name">
            </dialog-body>
            <dialog-footer>
                <button type="button" class="btn btn-default" [disabled]="uploading"
                    (click)="hide()">Cancel</button>
                <button type="button" class="btn btn-primary" [disabled]="uploading"
                    (click)="submit()">Upload</button>
            </dialog-footer>
        </dialog-modal>
    `,
})
export class ChipsetModal {

    // Hack because the angular compiler does not
    // bind properly the this object.
    _fc = (f: File) => this.handleFileChange(f);
    _rd = () => this.resetData();

    private id: string;
    private error_message: string = '';
    private img_state: ImgState = ImgState.Nothing;
    private uploading: boolean = false;
    private chipset_name: string = '';
    private percentage_upload: number = 0;

    private img_obj: HTMLImageElement;
    private file?: File;

    @ViewChild('upload')
    private dialog: Dialog;

    constructor() {
        this.id = uniqueId('upload');
    }

    ngAfterViewInit() {
        this.img_obj = document.getElementById(this.id) as HTMLImageElement;
    }

    show() {
        this.dialog.show();
    }

    hide() {
        this.dialog.hide();
    }

    resetData() {
        this.percentage_upload = 0;
        this.chipset_name = '';
        this.img_state = ImgState.Nothing;
        this.error_message = '';
        this.file = undefined;
        this.uploading = false;
    }

    handleFileChange(file: File) {
        if (file.size > ChipsetMaxFileSize) {
            this.error_message = 'Error: File must be less than 20MB';
        } else if (!/^image\//.test(file.type)) {
            this.error_message = 'Error: File type must be an image.';
        } else {
            this.chipset_name = file.name;
            this.file = file;
            this.img_state = ImgState.LoadingImg;
            const file_reader = new FileReader();
            file_reader.onload = e => {
                this.img_obj.src = (e.target as any).result;
                this.img_obj.onload = () => this.img_state = ImgState.ImgPresent;
            };
            file_reader.readAsDataURL(file);
        }
    }

    submit() {
        this.lock();
        (new Observable<number>((subscriber: Subscriber<number>) => {
            const form = new FormData();
            const xhr = new XMLHttpRequest();

            form.append('chipset', this.file);
            form.append('chipset_name', this.chipset_name);

            xhr.upload.ontimeout = () => {
                subscriber.error('Error: time out.');
            };
            xhr.upload.onprogress = e => {
                if (e.lengthComputable) {
                    subscriber.next((e.loaded * 100) / e.total);
                }
            };
            xhr.upload.onload = () => {
                subscriber.next(100);
            };
            xhr.onload = () => {
                let body = isDef(xhr.response) ? xhr.response : xhr.responseText;
                // Implicitly strip a potential XSSI prefix.
                if (isString(body)) body = body.replace(XSSI_PREFIX, '');

                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                let status: number = xhr.status === 1223 ? 204 : xhr.status;

                // fix status code when it is 0 (0 status is undocumented).
                if (status === 0) {
                    status = body ? 200 : 0;
                }

                if (status === 200) {
                    subscriber.complete();
                } else {
                    let {message, errors} = JSON.parse(body);
                    let reason = values(errors).join(',');
                    subscriber.error(`Error: ${message}, reason: ${reason}`);
                }
            };
            function isDef(obj: any): boolean {
                return obj !== undefined && obj !== null;
            }
            xhr.open('POST', '/api/chipset/upload/', true);
            xhr.send(form);
        })).subscribe(
            val => this.percentage_upload = val,
            err => {
                this.error_message = err;
                this.unlock();
            },
            () => setTimeout(() => this.hide(), 500)
        );
    }

    private lock() {
        this.uploading = true;
        this.dialog.lock();
    }

    private unlock() {
        this.uploading = false;
        this.dialog.unlock();
    }
}
