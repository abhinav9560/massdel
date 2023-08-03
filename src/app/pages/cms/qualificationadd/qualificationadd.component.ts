import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-qualificationadd',
  templateUrl: './qualificationadd.component.html',
  styleUrls: ['./qualificationadd.component.scss']
})
export class QualificationaddComponent implements OnInit {
  userData: any = {
    access: []
  }
  imageUpload
  canNotEdit
  id
 
  constructor(private common: CommonService, private cmsservice: CmsService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.cmsservice.getSinglequalification(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    } else {
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
    if (!this.id) {
     
        const newformData = new FormData();
        newformData.append('name_english', formData.name_english.trim());
        newformData.append('name_aramaic', formData.name_aramaic.trim());
        this.cmsservice.insertqualification(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['qualification']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
    
    }
    else {
    
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('name_english', formData.name_english.trim());
        newformData.append('name_aramaic', formData.name_aramaic.trim());
        this.cmsservice.updatequalification(newformData).subscribe((response) => {
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

  goBack() {
    window.history.back()
  }
}
