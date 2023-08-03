import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { CustomerService } from '../customer.service';
import intlTelInput from 'intl-tel-input';
declare let intlTelInputUtils: any; //declare moment

@Component({
  selector: 'ngx-customer-add',
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.scss']
})
export class CustomerAddComponent implements OnInit {
  donotMatch :Boolean
  userData: any = {}
  id
  imageUrl
  profilePicture: any = ''
  Identification1
  image1
  lat
  lng
  address
  cityList: any = []
  mobile1
  mobile2
  mobile
  canEdit = true
  constructor(private common: CommonService, private customerservice: CustomerService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }


  ngOnInit(): void {
    const input = document.querySelector("#mobile");
    this.mobile = intlTelInput(input, {
      separateDialCode: true,
      preferredCountries: ["in"],
      formatOnDisplay: false,
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.3/js/utils.js"
    });
    this.id = this.routes.snapshot.params.id;
    this.common.showLoader()
    this.customerservice.getCity().subscribe(res => {
      this.cityList = res['data']
    })
    if (this.id) {
      const newformData = new FormData();
      newformData.append('user_id', this.id);
      this.customerservice.getSingle(newformData).subscribe(res => {
        this.userData = res['response']
        this.address = res['response'].address
        this.mobile.setNumber(res['response'].mobile);
        this.mobile1 = res['response'].mobile.replace('+', '').replace(this.mobile.getSelectedCountryData().dialCode, '')
        this.imageUrl = res['imageUrl']
      })
      this.common.hideLoader()
    }
    else { this.common.hideLoader() }
  }

  userSubmit = async (formData) => {

    if (formData.name.trim().length < 3) {
      this.toastrService.show('error', 'Invalid Name', { status: 'danger' });
      this.common.hideLoader()
      return
    }

    if (formData.mobile.trim().length < 3) {
      this.toastrService.show('error', 'Invalid Mobile', { status: 'danger' });
      this.common.hideLoader()
      return
    }

    if (formData.password !== formData.confirmPassword) {
      this.toastrService.show('error', 'Password and confirm password do not match', { status: 'danger' });
      this.common.hideLoader()
      return
    }

    this.common.showLoader()
    var mobile = this.mobile.getNumber(intlTelInputUtils.numberFormat.E164)
    if (!this.id) {

      const newformData = new FormData();
      newformData.append('name', formData.name.trim());
      // newformData.append('email', formData.email);
      newformData.append('password', formData.password.trim());
      newformData.append('mobile', mobile.trim());
      newformData.append('profilePicture', this.profilePicture);
      // newformData.append('address', this.address);
      newformData.append('city', formData.city);
      // newformData.append('lat', this.lat); 
      // newformData.append('lng', this.lng);
      this.customerservice.insert(newformData).subscribe((response) => {
        this.common.hideLoader()
        if (response['status'] == 1) {
          this.router.navigate(['customer']);
          this.toastrService.show('Success', response['message'], { status: 'success' });
        } else {
          this.toastrService.show('Error', response['message'], { status: 'danger' });
        }
      });

    }
    else {

      const newformData = new FormData();
      newformData.append('user_id', this.id);
      newformData.append('name', formData.name.trim());
      // newformData.append('email', formData.email);
      newformData.append('mobile', mobile.trim());
      if (this.profilePicture) {
        newformData.append('profilePicture', this.profilePicture);
      }
      // newformData.append('address', this.address);
      newformData.append('city', formData.city);
      // newformData.append('lat', this.lat);
      // newformData.append('lng', this.lng);
      this.customerservice.update(newformData).subscribe((response) => {
        this.common.hideLoader()
        if (response['status'] == 1) {
          this.router.navigate(['customer/view', this.id]);
          this.ngOnInit()
          this.toastrService.show('Success', response['message'], { status: 'success' });
        } else {
          this.toastrService.show('Error', response['message'], { status: 'danger' });
        }
      });

    }
  };
  goBack() {
    window.history.back()
  }

  uploadFile(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png') {
      if (event.target.files && event.target.files[0]) {
        this.profilePicture = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.Identification1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.Identification1 = '';
      this.profilePicture = '';
      this.canEdit = false
    }
  }

  AddressSelect(event) {
    this.lat = event.geometry.location.lat();
    this.lng = event.geometry.location.lng();
    this.address = event.formatted_address;
  }

  check(value) {
    if (this.userData['password'] == value) {
      this.donotMatch = false
    } else {
      this.donotMatch = true
    }
  }
}
