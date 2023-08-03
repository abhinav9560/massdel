import { Component, OnInit } from '@angular/core';
import { CommonService } from 'app/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { ServiceproviderService } from '../serviceprovider.service';
import intlTelInput from 'intl-tel-input';
declare let intlTelInputUtils: any; //declare moment

@Component({
  selector: 'ngx-service-provider-add',
  templateUrl: './service-provider-add.component.html',
  styleUrls: ['./service-provider-add.component.scss']
})
export class ServiceProviderAddComponent implements OnInit {
  donotMatch:Boolean
  userData: any = {}
  max = new Date()
  id
  temp1
  temp2
  temp3
  temp4
  temp5

  lat
  lng
  address
  address1

  profilePicture: any = ''
  profilePicture1: any = ''

  identification: any = ''
  identification1: any = ''

  educationImage: any = ''
  educationImage1: any = ''

  tradeLicense: any = ''
  tradeLicense1: any = '' 
  
  tinCertificate: any = ''
  tinCertificate1: any = ''

  imageUrl

  category = []
  categoryArray = []

  subCategory = []
  subCategoryArray = []

  language = []

  cityList: any = []
  languageList: any = []
  qualificationList: any = []
  trainingList: any = []
  mobile1
  mobile2
  mobile

  constructor(private common: CommonService, private providerService: ServiceproviderService, private router: Router, private routes: ActivatedRoute, private toastrService: NbToastrService) { }

  ngOnInit(): void {

    const input = document.querySelector("#mobile");
    this.mobile = intlTelInput(input, {
      separateDialCode: true,
      preferredCountries: ["in"],
      formatOnDisplay: false,
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.3/js/utils.js"
    });
   
    this.common.showLoader()

    this.providerService.getCity().subscribe(res => {
      this.cityList = res['data']
    })
    this.providerService.getLanguage().subscribe(res => {
      this.languageList = res['data']
    })
    this.providerService.getQualification().subscribe(res => {
      this.qualificationList = res['data']
    })
    this.providerService.getTraining().subscribe(res => {
      this.trainingList = res['data']
    })

    this.id = this.routes.snapshot.params.id;
    this.providerService.getAllCategory({}).subscribe((res) => {
      this.categoryArray = res['data']
      if (this.id) {
        const newformData = new FormData();
        newformData.append('user_id', this.id);
        this.providerService.getSingleServiceprovider(newformData).subscribe(res => {
          this.userData = res['response']
          this.address = res['response'].address
          this.address1 = res['response'].residence

          this.mobile.setNumber(res['response'].mobile);
          this.mobile1 = res['response'].mobile.replace('+','').replace(this.mobile.getSelectedCountryData().dialCode,'')
    
          this.category = res['response'].category
          this.subCategory = res['response'].subCategory
          this.language = res['response'].language
          this.categoryChange('')
          this.imageUrl = res['imageUrl']
          
          this.common.hideLoader()
        })
      }
      else {
        this.common.hideLoader()
      }
    })
  }

  userSubmit = async (formData) => {
    if (formData.name.trim().length < 3) {
      this.toastrService.show('error', 'Invalid Name', { status: 'danger' });
      this.common.hideLoader()
      return
    }
    if (formData.address.trim().length < 3) {
      this.toastrService.show('error', 'Invalid address', { status: 'danger' });
      this.common.hideLoader()
      return
    }
    if (formData.residence.trim().length < 3) {
      this.toastrService.show('error', 'Invalid residence', { status: 'danger' });
      this.common.hideLoader()
      return
    }
    // if (formData.country.trim().length < 3) {
    //   this.toastrService.show('error', 'Invalid country', { status: 'danger' });
    //   this.common.hideLoader()
    //   return
    // }
 
   
    if(!this.address ){
      this.toastrService.show('error', 'Select address from google suggestions', { status: 'danger' });
      return
    }
    if(!this.address1){
      this.toastrService.show('error', 'Select address from google suggestions', { status: 'danger' });
      return
    }
  
  

    this.common.showLoader()
    var mobile = this.mobile.getNumber(intlTelInputUtils.numberFormat.E164)
    if (!this.id) {
     
        const newformData = new FormData();
        newformData.append('name', formData.name.trim());
        newformData.append('password', formData.password.trim());
        newformData.append('mobile', mobile.trim());
        newformData.append('city', formData.city);
        newformData.append('identification', this.identification);
        newformData.append('profilePicture', this.profilePicture);
        newformData.append('educationImage', this.educationImage);
        newformData.append('tradeLicense', this.tradeLicense);
        newformData.append('tinCertificate', this.tinCertificate);
        newformData.append('address', this.address.trim());
        newformData.append('residence', this.address1.trim());
        newformData.append('sex', formData.sex);
        newformData.append('dob', formData.dob);
       
        newformData.append('qualification', formData.qualification);
        newformData.append('training', formData.training);
        newformData.append('country', formData.country);
        if(this.lat && this.lng){
          newformData.append('lat', this.lat?this.lat:null);
          newformData.append('lng', this.lng?this.lng:null);
        }
      
        let temp = this.category.join(",");
        newformData.append('category', temp);
        let temp1 = this.subCategory.join(",");
        newformData.append('subCategory', temp1);

        let temp2 = this.language.join(",");
        newformData.append('language', temp2);

        this.providerService.insertServiceprovider(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['service-provider']);
            this.toastrService.show('Success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('Error', response['message'], { status: 'danger' });
          }
        });
   
    }
    else {
   
        const newformData = new FormData();
        newformData.append('user_id', this.id);
        newformData.append('name', formData.name);
        newformData.append('mobile', mobile);
        newformData.append('city', formData.city);
        newformData.append('identification', this.identification);
        newformData.append('profilePicture', this.profilePicture);
        newformData.append('educationImage', this.educationImage);
        newformData.append('tradeLicense', this.tradeLicense);
        newformData.append('tinCertificate', this.tinCertificate);
        newformData.append('address', this.address);
        newformData.append('residence', this.address1);
        newformData.append('sex', formData.sex);
        newformData.append('dob', formData.dob);
        newformData.append('qualification', formData.qualification);
        newformData.append('training', formData.training);
        newformData.append('country', formData.country);
        if(this.lat && this.lng){
          newformData.append('lat', this.lat?this.lat:null);
          newformData.append('lng', this.lng?this.lng:null);
        }
        let temp = this.category.join(",");
        newformData.append('category', temp);
        let temp1 = this.subCategory.join(",");
        newformData.append('subCategory', temp1);

        let temp2 = this.language.join(",");
        newformData.append('language', temp2);

        this.providerService.updateServiceprovider(newformData).subscribe((response) => {
          this.common.hideLoader()
          if (response['status'] == 1) {
            this.router.navigate(['service-provider/view', this.id]);
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

  uploadFile1(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
      if (event.target.files && event.target.files[0]) {
        this.identification = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.identification1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.identification1 = '';
      this.identification = '';
    }
  }


  uploadFile2(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
      if (event.target.files && event.target.files[0]) {
        this.profilePicture = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.profilePicture1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.profilePicture1 = '';
      this.profilePicture = '';
    }
  }

  uploadFile3(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
      if (event.target.files && event.target.files[0]) {
        this.educationImage = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.educationImage1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.educationImage1 = '';
      this.educationImage = '';
    }
  }

  uploadFile4(event) {
    let file = event.target.files[0];
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
      if (event.target.files && event.target.files[0]) {
        this.tradeLicense = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.tradeLicense1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.tradeLicense1 = '';
      this.tradeLicense = '';
    }
  } 
  
  uploadFile5(event) {
    let file = event.target.files[0];
    console.log()
    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/jpg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'application/pdf') {
      if (event.target.files && event.target.files[0]) {
        this.tinCertificate = <File>event.target.files[0];
        let reader = new FileReader();
        reader.onload = (event: any) => {
          this.tinCertificate1 = event.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
      }
    } else {
      this.toastrService.show('error', 'Invalid Image format', { status: 'danger' });
      this.tinCertificate = '';
      this.tinCertificate1 = '';
    }
  }

  AddressSelect(event) {
    this.lat = event.geometry.location.lat();
    this.lng = event.geometry.location.lng();
    this.address = event.formatted_address;
  }

  AddressSelect1(event) {
    this.address1 = event.formatted_address;
  }

  categoryChange(event) {
    this.providerService.getSubcategory(this.category).subscribe((res) => {
      this.subCategoryArray = res['data']
    })
  }

  openDob() {
    document.getElementById('dob').focus();
    return false;
  }

  check(value) {
    if (this.userData['password'] == value) {
      this.donotMatch = false
    } else {
      this.donotMatch = true
    }
  }
}
