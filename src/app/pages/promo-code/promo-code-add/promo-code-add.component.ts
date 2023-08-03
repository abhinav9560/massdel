import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbDateService, NbToastrService } from '@nebular/theme';
import { PromoCodeService } from '../promo-code.service';


@Component({
  selector: 'ngx-promo-code-add',
  templateUrl: './promo-code-add.component.html',
  styleUrls: ['./promo-code-add.component.scss']
})
export class PromoCodeAddComponent implements OnInit {
  userData: any = {
    access: []
  }
  id
  typeArray = ['Flat','Percentage']
  max: Date = new Date();
  constructor(private common: CommonService, private promocodeService: PromoCodeService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService,protected dateService: NbDateService<Date>) { 
    this.max = this.dateService.today()
  }

  ngOnInit(): void {
    this.id = this.routes.snapshot.params.id;
    this.common.showLoader()
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.promocodeService.getSingle(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    } else {
      this.common.hideLoader()
    }
  }

  userSubmit = async (formData) => {
  
    if(formData.name.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of name', { status: 'danger' });
      return
    }
    if(formData.couponCode.trim().length<3){
      this.toastrService.show('error', 'Atleaset 3 character of couponCode', { status: 'danger' });
      return
    }
    this.common.showLoader()
    if (!this.id) {
   
        const newformData = new FormData();
        newformData.append('type', formData.type.trim());
        newformData.append('name', formData.name.trim());
        newformData.append('couponCode', formData.couponCode.trim());
        newformData.append('discount', formData.discount);
        newformData.append('limitPerUser', formData.limitPerUser);
        newformData.append('startDate', formData.startDate);
        newformData.append('endDate', formData.endDate);
        this.promocodeService.insert(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['promocode']);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('error', response['message'], { status: 'danger' });
          }
        });
    }
    else {
        const newformData = new FormData();
        newformData.append('id', this.id);
        newformData.append('type', formData.type.trim());
        newformData.append('name', formData.name.trim());
        newformData.append('couponCode', formData.couponCode.trim());
        newformData.append('discount', formData.discount);
        newformData.append('limitPerUser', formData.limitPerUser);
        newformData.append('startDate', formData.startDate);
        newformData.append('endDate', formData.endDate);
        this.promocodeService.update(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['promocode/view', this.id]);
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

  accessChange(e){

  }
}
