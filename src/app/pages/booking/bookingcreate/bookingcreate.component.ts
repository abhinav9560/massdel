import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { BookingService } from '../booking.service';

@Component({
  selector: 'ngx-bookingcreate',
  templateUrl: './bookingcreate.component.html',
  styleUrls: ['./bookingcreate.component.scss']
})
export class BookingcreateComponent implements OnInit {
  customerData = []
  customertemp
  customer = {
    _id: '',
    name: '',
    mobile: ''
  }

  providerData = []
  providertemp
  provider = {
    _id: '',
    name: '',
    mobile: ''
  }

  categoryArray = []
  category

  subCategoryArray = []
  subCategory

  address
  lat
  lng
  paymentMode

  paymentModeArray = [
    { name: 'cod', value: 'cod' },
    { name: 'wallet', value: 'wallet' },
    { name: 'online', value: 'online' },
  ]

  typeArray = [
    { name: 'asap', value: 'asap' },
    { name: 'scheduled', value: 'scheduled' },
  ]
  type
  date = new Date()
  additionalNotes

  file
  imgaeArray

  constructor(private common: CommonService, private bookingservice: BookingService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit() {
    this.bookingservice.getAllCat({}).subscribe(res => {
      this.categoryArray = res['data']
    })
  }

  getSubcat(val) {
    const newformData = new FormData();
    newformData.append('id', this.category);
    this.bookingservice.getSubCat(newformData).subscribe(res => {
      this.subCategoryArray = res['data']
    })
  }

  onModelChange(value: string) {
    const newformData = new FormData();
    newformData.append('search', value);
    this.bookingservice.searchCustomer(newformData).subscribe(res => {
      this.customerData = res['data']
    })
  }

  onSelectionChange(value) {
    if (value && value.name) {
      this.customer = value
      this.customertemp = ''
    }
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
      this.providertemp = ''
    }
  }

  addressSelect(eve) {
    this.lat = eve.geometry.location.lat();
    this.lng = eve.geometry.location.lng();
    this.address = eve.formatted_address;
  }

  openDob() {
    document.getElementById('dob').focus();
    return false;
  }

  uploadFile(event) {
    let file = event.target.files[0];
    // if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
    if (event.target.files && event.target.files[0]) {
      this.imgaeArray = <File>event.target.files[0]
      let reader = new FileReader();
      // reader.onload = (event: any) => {
      //   this.educationImage1 = event.target.result;
      // }
      reader.readAsDataURL(event.target.files[0]);
    }
    // } else {
    //   this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
    //   this.imgaeArray = []
    // }
  }

  goBack() {
    window.history.back()
  }

  checkValidation() {
    if (!this.address) {
      alert('Please select address')
      return false
    }
    if (!this.provider._id) {
      alert('Please select provider')
      return false
    }
    if (!this.customer._id) {
      alert('Please select customer')
      return false
    }
    if (!this.paymentMode) {
      alert('Please select paymentMode')
      return false
    }
    if (!this.subCategory) {
      alert('Please select subCategory')
      return false
    }
    if (!this.category) {
      alert('Please select category')
      return false
    }
    if (!this.type) {
      alert('Please select type')
      return false
    }
    return true
  }

  submit() {
    const newformData = new FormData();
    newformData.append('address', this.address);
    newformData.append('additionalNotes', this.additionalNotes || '');
    newformData.append('providerId', this.provider._id);
    newformData.append('customerId', this.customer._id);
    newformData.append('paymentMode', this.paymentMode);
    newformData.append('subCategory', this.subCategory);
    newformData.append('category', this.category);
    newformData.append('type', this.type);
    newformData.append('scheduleDate', String(this.date));

    newformData.append('lat', this.lat);
    newformData.append('lng', this.lng);
    newformData.append('image', this.imgaeArray);
    if (this.checkValidation()) {
      console.log('here')
      this.bookingservice.insertBooking(newformData).subscribe(res => {
        console.log(res)
        if (res['status'] == 1) {
          this.router.navigate(['booking/view', res['data']._id]);
          this.toastrService.show('success', res['message'], { status: 'success' });
        } else {
          this.toastrService.show('error', res['message'], { status: 'danger' });
        }
      })
    }

  }
}