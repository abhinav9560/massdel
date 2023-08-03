import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-slideradd',
  templateUrl: './slideradd.component.html',
  styleUrls: ['./slideradd.component.scss']
})
export class SlideraddComponent implements OnInit {
  userData: any = {
    access: []
  }
  imageUpload
  canNotEdit
  selectedImage
  id
  imageUrl
  imageName


  constructor(private common: CommonService, private cmsservice: CmsService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.cmsservice.getSingleslider(newformData).subscribe(res => {
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

    this.common.showLoader()
    if (!this.id) {

      const newformData = new FormData();

      newformData.append('image', this.imageUpload);
      this.cmsservice.insertslider(newformData).subscribe((response) => {
        this.common.hideLoader()
        if (response['status'] == 1) {
          this.router.navigate(['slider']);
          this.toastrService.show('success', response['message'], { status: 'success' });
        } else {
          this.toastrService.show('error', response['message'], { status: 'danger' });
        }
      });

    }
    else {

      const newformData = new FormData();
      newformData.append('id', this.id);

      newformData.append('image', this.imageUpload);
      this.cmsservice.updateslider(newformData).subscribe((response) => {
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
