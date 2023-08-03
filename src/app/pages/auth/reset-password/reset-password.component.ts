import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'ngx-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  userData: any = {}
  slug;
  user_id;
  otp;
  donotMatch
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private toastrService: NbToastrService,
    private common: CommonService
  ) {
    if (this.route.snapshot.queryParams) {
      // console.log(this.route.snapshot.params);
      this.slug = this.route.snapshot.params.slug;
      this.slug = atob(this.slug).split(":");
      if (this.slug instanceof Array) {
        this.user_id = this.slug[0];
        this.otp = this.slug[1];
        this.checkData();
      } else {
        this.toastrService.show('Error', "Link has expired", { status: 'danger' });
       setTimeout(() => {
            this.router.navigate(['login'])
          }, 1500);
      }
    } else {
      this.toastrService.show('Error', "Link has expired", { status: 'danger' });
     setTimeout(() => {
            this.router.navigate(['login'])
          }, 1500);
    }
    // this.myservices.checkAdminLogout();
  }

  ngOnInit() {
  }

  checkData = async () => {
    var newFormData = new FormData();
    newFormData.append("user_id", this.user_id)
    newFormData.append("otp", this.otp)
    this.auth.verifyOTP(newFormData).subscribe((response) => {
      this.common.hideLoader();
      if (response['status'] == 1) { } else {
        this.toastrService.show('Error', "Link has expired", { status: 'danger' });
       setTimeout(() => {
            this.router.navigate(['login'])
          }, 1500);;
      }
    }, (error) => {
      console.log(error);
      this.toastrService.show('Error', "Link has expired", { status: 'danger' });
     setTimeout(() => {
            this.router.navigate(['login'])
          }, 1500);;
    });

  }

  submit = async (formData) => {
    if (formData.password == formData.confirm_password) {
      var newFormData = new FormData();
      newFormData.append("user_id", this.user_id)
      newFormData.append("password", formData.password)
      newFormData.append("confirm_password", formData.confirm_password)
      this.common.showLoader();
      await this.auth.reset_password(newFormData).subscribe((response) => {
        this.common.hideLoader();
        if (response['status'] == 1) {
          this.toastrService.show('Success', response['message'], { status: 'success' });
          setTimeout(() => {
            this.router.navigate(['login'])
          }, 1500);
        } else {
          this.toastrService.show('Error', response['message'], { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }


  check(val) {
    // console.log(val)
    // console.log(this.userData.password)
    // console.log(this.userData.confirm_password)
    if (this.userData['password'] == val) {
      this.donotMatch = false
    } else {
      this.donotMatch = true
    }
  }

}
