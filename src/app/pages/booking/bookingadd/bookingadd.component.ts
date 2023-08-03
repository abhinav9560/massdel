import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { BookingService } from '../booking.service';

@Component({
  selector: 'ngx-bookingadd',
  templateUrl: './bookingadd.component.html',
  styleUrls: ['./bookingadd.component.scss']
})
export class BookingaddComponent implements OnInit {

  userData: any = {}
  id
  name

  providerData
  provider
  providertemp
  constructor(private common: CommonService, private bookingservice: BookingService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {
    this.common.showLoader()
    this.id = this.routes.snapshot.params.id;
    if (this.id) {
      const newformData = new FormData();
      newformData.append('id', this.id);
      this.bookingservice.getSingle(newformData).subscribe(res => {
        this.userData = res['data']
        this.common.hideLoader()
      })
    }
  }

  userSubmit(event) {
    console.log(event)
  }

  goBack() {
    window.history.back()
  }

  onModelChange1(value: string) {
    const newformData = new FormData();
    newformData.append('search', value);
    this.bookingservice.searchProvider(newformData).subscribe(res => {
      this.providerData = res['data']
    })
  }

  onSelectionChange1(value) {
    if (value && value.name) {
      this.provider = value
      this.providertemp = value.name
    }
  }

  assignProvider() {
    if (this.provider && this.provider._id && this.provider.name) {
      if (confirm('Are you sure to chnage the provider')) {
        const newformData = new FormData();
        newformData.append('providerId', this.provider._id);
        newformData.append('id', this.id);
        this.bookingservice.changeProvider(newformData).subscribe(res => {

          this.provider = {}
          this.providertemp = ''
          if (res['status'] == 1) {
            this.toastrService.show('success', res['message'], { status: 'success' });
            this.ngOnInit()
          } else {
            this.toastrService.show('error', res['message'], { status: 'danger' });
            this.ngOnInit()
          }

        })
      } else {
        return false
      }
    } else {
      alert('Please select provider')
    }
  }

}
