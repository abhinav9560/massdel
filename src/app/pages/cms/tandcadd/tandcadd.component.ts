import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-tandcadd',
  templateUrl: './tandcadd.component.html',
  styleUrls: ['./tandcadd.component.scss']
})
export class TandcaddComponent implements OnInit {
  userData: any = {
    access: []
  }
  id
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
   
    customClasses: [
    {
      name: 'quote',
      class: 'quote',
    },
    {
      name: 'redText',
      class: 'redText'
    },
    {
      name: 'titleText',
      class: 'titleText',
      tag: 'h1',
    },
  ],
  sanitize: false,
  toolbarPosition: 'top',
  toolbarHiddenButtons: [
    [
      'undo',
      'redo',
      'strikeThrough',
      'indent',
      'outdent',
      'insertUnorderedList',
      'insertOrderedList',
      'fontName'
    ],
    [
      'textColor',
      'backgroundColor',
      'customClasses',
      'link',
      'unlink',
      'insertImage',
      'insertVideo',
      'insertHorizontalRule',
      'removeFormat',
      'toggleEditorMode'
    ]
  ]
};



  constructor(private common: CommonService, private cmsservice: CmsService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.cmsservice.getSingletandc(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    } else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
   
    this.common.showLoader()
    if (!this.id) {
    
        const newformData = new FormData();
        newformData.append('title', formData.title);
        newformData.append('slug', formData.slug);
        newformData.append('description_english', formData.description_english);
        newformData.append('description_aramaic', formData.description_aramaic);
        this.cmsservice.inserttandc(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['cms']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
    
    }
    else {
    
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('title', formData.title);
        newformData.append('slug', formData.slug);
        newformData.append('description_english', formData.description_english);
        newformData.append('description_aramaic', formData.description_aramaic);
        this.cmsservice.updatetandc(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['cms/view', this.id]);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        });
    

    }
  };

  goBack() {
    window.history.back()
  }
}
