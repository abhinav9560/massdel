import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-guideadd',
  templateUrl: './guideadd.component.html',
  styleUrls: ['./guideadd.component.scss']
})
export class GuideaddComponent implements OnInit {
  userData: any = {
    access: []
  }
  imageUpload
  canNotEdit
  selectedImage
  id
  imageUrl
  imageName
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '25rem',
    minHeight: '5rem',
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
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
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
    uploadUrl: 'v1/image',
    uploadWithCredentials: false,
    sanitize: true,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize']
    ]
  };


  constructor(private common: CommonService, private cmsservice: CmsService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.cmsservice.getSingle(newformData).subscribe(res => {
        this.userData = res['data']
        this.imageUrl = res['imageUrl']
        this.imageName = this.userData['image']
        this.imageUpload = this.userData['image']
        this.common.hideLoader()
      })
    } else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
    if(formData.title_english.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Title (English)', { status: 'danger' });
      return
    }
    if(formData.title_aramaic.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Title (Arhemic)', { status: 'danger' });
      return
    }
    if(formData.description_english.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Description (English)', { status: 'danger' });
      return
    }
    if(formData.description_aramaic.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of Description (English)', { status: 'danger' });
      return
    }
    this.common.showLoader()
    if (!this.id) {
   
        const newformData = new FormData();
        newformData.append('title_english', formData.title_english.trim());
        newformData.append('title_aramaic', formData.title_aramaic.trim());
        newformData.append('description_english', formData.description_english);
        newformData.append('description_aramaic', formData.description_aramaic);
        newformData.append('image', this.imageUpload);
        this.cmsservice.insert(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['guide']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
     
    }
    else {
    
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('title_english', formData.title_english.trim());
        newformData.append('title_aramaic', formData.title_aramaic.trim());
        newformData.append('description_english', formData.description_english);
        newformData.append('description_aramaic', formData.description_aramaic);
        newformData.append('image', this.imageUpload);
        this.cmsservice.update(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
           this.ngOnInit()
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        });
     

    }
  };

  uploadFile(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png') {
      if (event.target.files && event.target.files[0]) {
        this.imageUpload = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.selectedImage = event.target.result;
          this.canNotEdit = false
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.selectedImage = '';
      this.imageUpload = '';
      this.canNotEdit = true
    }
  }

  goBack() {
    window.history.back()
  }
}
