import {Component, Input} from '@angular/core';

const uploadCss = require<Webpack.Scss>('./upload.scss');

@Component({
    selector: 'upload',
    styles: [uploadCss.toString()],
    template: `
    <span class="btn btn-default btn-file">
        Browse <input type="file" (change)="handleFileChange($event)">
    </span>
    `
})
export class Upload {

    @Input() fileChange: (file: File) => void;

    handleFileChange(event: Event) {
        let files = (event.target as HTMLInputElement).files;
        let file: File = files && files[0];
        if (file) {
            this.fileChange(file);
        }
    }
}
