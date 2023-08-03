import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'ngx-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData: any = {}
  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.auth.profile({}).subscribe((res) => {
      this.userData = res['response']
    })
  }
  goBack() {
    window.history.back()
  }
}
