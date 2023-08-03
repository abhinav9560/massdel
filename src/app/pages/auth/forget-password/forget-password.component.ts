import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { AuthService } from '../auth.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  userData: any = {}
  settimeout: any = ''
  canSubmit: Boolean = true
  constructor(private common: CommonService,
    private auth: AuthService,
    private toastrService: NbToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.common.hideLoader()
  }

  submit(formdata) {
    console.log(this.canSubmit)
    if (!this.canSubmit) {
      this.toastrService.show('Error', 'Please check your mail or try after 30 seconds', { status: 'danger' });
      return
    }
    const newformData = new FormData();
    newformData.append('email', formdata.email.trim().toLowerCase());
    this.auth.forgetPass(newformData).subscribe((res) => {
      if (res['status'] == 1) {
        this.canSubmit = false
        this.settimeout = setTimeout(() => {
          this.canSubmit = true
        }, 30000);

        this.toastrService.show('Success', res['message'], { status: 'success' });
      }
      else {
        this.toastrService.show('Error', res['message'], { status: 'danger' });
      }
    })
  }

  ngOnDestroy() {
    if (this.settimeout) {
      this.settimeout.clearInterval();
    }
  }

  resend() {
    if (this.userData) {
      if (this.userData.email) {
        let formdata = {
          email: this.userData.email
        }
        this.submit(formdata)
      } else {
        this.toastrService.show('Error', 'Please enter email', { status: 'danger' });
        return
      }
    }
  }

}
