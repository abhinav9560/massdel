import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { AuthService } from '../auth.service';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userData: any = {}
  constructor(private common: CommonService,
    private auth: AuthService,
    private toastrService: NbToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.common.hideLoader()
    let token = localStorage.getItem('token')
    let user_id = localStorage.getItem('user_id')
    let user_data = localStorage.getItem('user_data')
    if (token && user_id && user_data) {
      this.router.navigate(['/dashboard'])
    } else {
      null
      localStorage.clear()
    }
  }

  submit(formdata) {
    const newformData = new FormData();
    newformData.append('email', formdata.email.trim().toLowerCase());
    newformData.append('password', formdata.password.trim());
    this.auth.login(newformData).subscribe((res) => {
      if (res['status'] == 1) {
        this.toastrService.show('Success', res['message'], { status: 'success' });
        localStorage.setItem('token', res['token'])
        localStorage.setItem('user_id', res['response']['user_id'])
        localStorage.setItem('user_data', JSON.stringify(res['response']['user_data']))
        this.router.navigate(['/dashboard'])
      }
      else {
        this.toastrService.show('Error', res['message'], { status: 'danger' });
      }
    })
  }
}
