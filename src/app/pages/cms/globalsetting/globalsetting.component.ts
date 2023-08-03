import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-globalsetting',
  templateUrl: './globalsetting.component.html',
  styleUrls: ['./globalsetting.component.scss']
})
export class GlobalsettingComponent implements OnInit {
  userData: any = {
    paymentMode: {
      cod: Boolean
    }
  }
  id

  constructor(private common: CommonService, private cmsservice: CmsService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.cmsservice.getGlobalsetting().subscribe((response) => {
      this.common.hideLoader()
      this.userData = response['data']
      this.userData.cod = response['data']['paymentMode'].cod || false
      this.userData.online = response['data']['paymentMode'].online || false
      this.userData.wallet = response['data']['paymentMode'].wallet || false
    })
  }

  userSubmit = async (formData) => {
    this.common.showLoader()
    console.log(formData)
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('commision', formData.commision);
      newformData.append('referralAmountBy', formData.referralAmountBy);
      newformData.append('referralAmountTo', formData.referralAmountTo);
      newformData.append('defaultRadius', formData.defaultRadius);
      newformData.append('cancellationTime', formData.cancellationTime);
      let paymentMode = { cod: formData.cod, online: formData.online, wallet: formData.wallet }
      newformData.append('paymentMode', JSON.stringify(paymentMode));
      this.cmsservice.globalsetting(newformData).subscribe((response) => {
        this.common.hideLoader()
        if (response['status'] == 1) {
          this.ngOnInit()
          this.toastrService.show('success', response['message'], { status: 'success' });
        } else {
          this.toastrService.show('success', response['message'], { status: 'danger' });
        }
      });
    } else {
      this.ngOnInit()
      return false
    }
  };

  goBack() {
    window.history.back()
  }
}
