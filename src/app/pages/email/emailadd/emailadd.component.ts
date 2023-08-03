import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { EmailService } from '../email.service';

import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'ngx-emailadd',
  templateUrl: './emailadd.component.html',
  styleUrls: ['./emailadd.component.scss']
})
export class EmailaddComponent implements OnInit {
  userData: any = {
    access: []
  }
  id

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: 'auto',
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


  constructor(private common: CommonService, private emailservice: EmailService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.id = this.routes.snapshot.params.id;
    this.common.showLoader()
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.emailservice.getSingle(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    } else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
    // console.log(formData)
    // console.log(this.access)
    this.common.showLoader()
    if (!this.id) {
      if (confirm('Are you sure?')) {
        const newformData = new FormData();
        newformData.append('name', formData.name);
        newformData.append('slug', formData.slug);
        newformData.append('subject', formData.subject);
        newformData.append('description', formData.description);
        this.emailservice.insert(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['email']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
      } else {
        this.ngOnInit()
        return false

      }
    }
    else {
      if (confirm('Are you sure?')) {
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('name', formData.name);
        newformData.append('slug', formData.slug);
        newformData.append('subject', formData.subject);
        newformData.append('description', formData.description);
        this.emailservice.update(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['email/view', this.id]);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        });
      } else {
        this.ngOnInit()
        return false
      }

    }
  };

  goBack() {
    window.history.back()
  }
}
