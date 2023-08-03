import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';

@Component({
  selector: 'ngx-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  userData: any = {}
  donotMatch: Boolean

  constructor(private auth: AuthService, private toastrService: NbToastrService, private common: CommonService) { }

  ngOnInit(): void {
    this.common.hideLoader()
  }

  userSubmit = async (formData) => {
    if (formData.oldPassword.trim().length < 3) {
      this.toastrService.show('Error', "Invalid old password", { status: 'danger' });
      return
    }
    this.common.showLoader()
    const newformData = new FormData();
    newformData.append('oldPassword', formData.oldPassword.trim());
    newformData.append('newPassword', formData.newPassword.trim());
    newformData.append('confirmPassword', formData.confirmPassword.trim());
    this.auth.changePassowrd(newformData).subscribe((res) => {
      this.common.hideLoader()
      if (res['status'] == 1) {
        this.toastrService.show('Success', res['message'], { status: 'success' });
        this.ngOnInit()
        // this.userData = {}
      } else {
        this.toastrService.show('Error', res['message'], { status: 'danger' });
        this.ngOnInit()
        // this.userData = {}
      }
    })
  };

  check(value) {
    if (this.userData['newPassword'] == value) {
      this.donotMatch = false
    } else {
      this.donotMatch = true
    }
  }

  goBack() {
    window.history.back()
  }

}
