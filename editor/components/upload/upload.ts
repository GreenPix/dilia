import {Component, View} from 'angular2/core';

let uploadCss = require<Webpack.Scss>('./upload.scss');

@Component({
    selector: 'upload'
})
@View({
    styles: [uploadCss.toString()],
    template: `
    <span class="btn btn-default btn-file">
        Browse <input type="file" (change)="handleFileChange($event)">
    </span>
    `
})
export class Upload {

    handleFileChange(event: Event) {
        console.log('FILE CHANGE EVENT!!');
        // let file: File = (event.target as HTMLInputElement).files[0];
        // let fd = new FormData();
        // let xhr = new XMLHttpRequest();
        // fd.append('file_content', file);
        // xhr.open('POST', '/api/upload/chipset');
        // xhr.send(fd);
    }
}
