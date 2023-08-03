import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CategoryService } from '../category.service';

@Component({
  selector: 'ngx-categoryadd',
  templateUrl: './categoryadd.component.html',
  styleUrls: ['./categoryadd.component.scss']
})
export class CategoryaddComponent implements OnInit {
  userData: any = {}
  imageName: string
  id
  imageUrl
  selectedImage;
  imageUpload;
  image1
  canNotEdit = false
  constructor(private common: CommonService, private categoryservice: CategoryService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.id = this.routes.snapshot.params.id;
    this.common.showLoader()
    if (this.id) {
      const newformData = new FormData();
      newformData.append('user_id', this.id);
      this.categoryservice.getSingle(newformData).subscribe(res => {
        this.imageUrl = res['imageUrl']
        this.userData = res['response']
        this.imageName = this.userData['image']
        this.imageUpload = this.userData['image']
        this.common.hideLoader()
      })
    }
    else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
    if(formData.name_english.trim().length < 3){
      this.toastrService.show('Error', "Invalid Name (English)", { status: 'danger' });
      return
    }
    if(formData.name_aramaic.trim().length < 3){
      this.toastrService.show('Error', "Invalid Name (Aramaic)", { status: 'danger' });
      return
    }
    this.common.showLoader()
    if (this.imageUpload) {
      if (!this.id) {
      
          const newformData = new FormData();
          newformData.append('name_english', formData.name_english.trim());
          newformData.append('name_aramaic', formData.name_aramaic.trim());
          newformData.append('image', this.imageUpload);
          this.categoryservice.insert(newformData).subscribe((response) => {
            this.common.hideLoader()
            if (response['status'] == 1) {
              this.router.navigate(['category']);
              this.toastrService.show('Success', response['message'], { status: 'success' });

            } else {
              this.toastrService.show('Error', response['message'], { status: 'danger' });
            }
          });
      
      }
      else {
       
          const newformData = new FormData();
          newformData.append('_id', this.id);
          newformData.append('name_english', formData.name_english.trim());
          newformData.append('name_aramaic', formData.name_aramaic.trim());
          newformData.append('image', this.imageUpload);
          this.categoryservice.update(newformData).subscribe((response) => {
            this.common.hideLoader()
            if (response['status'] == 1) {
              this.router.navigate(['category/view', this.id]);
              this.ngOnInit()
              this.toastrService.show('Success', response['message'], { status: 'success' });
            } else {
              this.toastrService.show('Error', response['message'], { status: 'danger' });
            }
          });
        }
      
    }
    else {
      this.toastrService.show('Error', 'Image is required', { status: 'danger' });
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
