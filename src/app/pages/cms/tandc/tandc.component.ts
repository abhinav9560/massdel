import { Component, OnInit } from '@angular/core';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { CmsService } from '../cms.service';

@Component({
  selector: 'ngx-tandc',
  templateUrl: './tandc.component.html',
  styleUrls: ['./tandc.component.scss']
})

export class TandcComponent implements OnInit {
  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  dateRange
  constructor( private common:CommonService,private cmsservice: CmsService, private toastrService: NbToastrService) {

  }
  ngOnInit() {

    this.getUsers('1', '');
  }

  getUsers = async (pageNo, searchItem, dateRange?) => {
    this.common.showLoader()
    const UsersList = new FormData();
    UsersList.append('pageNo', pageNo);
    UsersList.append('size', '8');
    UsersList.append('searchItem', searchItem);
    if (dateRange) {
      UsersList.append('dateRange', JSON.stringify(dateRange));
    }
    this.cmsservice.gettandc(UsersList).subscribe((res) => {
      this.data = res;
      this.items = Array.from({ length: res['pages'] }, (v, k) => k + 1);
      this.common.hideLoader()
    })
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  InactiveUser = async (Id, indexIs) => {

    if (confirm('Are you sure you want to Change status?')) {
      const newformData = new FormData();
      newformData.append('id', Id);
      await this.cmsservice.inactivetandc(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', 'There was an error please try after some time!!', { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }

  ActiveUser = async (Id, indexIs) => {
    if (confirm('Are you sure you want to Change status?')) {

      const newformData = new FormData();
      newformData.append('id', Id);
      await this.cmsservice.activetandc(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', 'There was an error please try after some time!!', { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }

  deleteUser = async (Id, Indexis) => {
    if (confirm('Are you sure you want to Delete?')) {
      const newformData = new FormData();
      newformData.append('id', Id);

      await this.cmsservice.deletetandc(newformData).subscribe((response) => {
        if (response['status'] == 1) {

          if (Indexis !== -1) {
            this.data.data.splice(Indexis, 1);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('success', response['message'], { status: 'danger' });
          }
        } else {
          this.toastrService.show('danger', 'There was an error please try after some time!!', { status: 'danger' });
        }
      });

    } else {
      return false;
    }
  }

  pageChanged(event) {
    this.getUsers(event, '')
  }
  searchEvent(searchItem) {
    this.getUsers('1', searchItem);
  };

  dateRangeChange() {
    console.log(this.dateRange)
    this.getUsers('1', '', this.dateRange);
  }
  reset() {
    this.dateRange = ''
    this.searchItem = { item: '' }
    this.ngOnInit()
  }
}
