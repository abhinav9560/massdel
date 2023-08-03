import { Component, OnInit } from '@angular/core';

import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { AdminService } from '../admin.service';
import { ExportToCsv } from 'export-to-csv';
import { NbDateService } from '@nebular/theme';

@Component({
  selector: 'ngx-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.scss']
})
export class AdminListComponent implements OnInit {
  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  max: Date = new Date();
  dateRange:any = {
    start:'',
    end:''
  }
  checkedArray = []
  checkAll: Boolean = false
  constructor(private adminservice: AdminService, private toastrService: NbToastrService, private common: CommonService,protected dateService: NbDateService<Date>) {
    this.max = this.dateService.today()
  }
  ngOnInit() {
    this.checkedArray = []
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
    this.adminservice.getAdminList(UsersList).subscribe((res) => {
      this.data = res;
      this.common.hideLoader()
      this.items = Array.from({ length: res['pages'] }, (v, k) => k + 1);
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
      await this.adminservice.inactiveSubadmin(newformData).subscribe((response) => {
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
      await this.adminservice.activeSubadmin(newformData).subscribe((response) => {
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
    if (confirm('Are you sure you want to Delete user?')) {
      const newformData = new FormData();
      newformData.append('user_id', Id);
      await this.adminservice.deleteSubAdmin(newformData).subscribe((response) => {
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
    if(!this.dateRange.start || !this.dateRange.end){
      this.toastrService.show('Error', 'Select a date range', { status: 'danger' });
      return 
    }
    if(this.dateRange.start >= this.dateRange.end){
      this.toastrService.show('Error', 'End date should be greater then start date', { status: 'danger' });
      return 
    }
    this.getUsers('1', '', this.dateRange);
  }

  reset() {
    this.dateRange = ''
    this.searchItem = { item: '' }
    this.ngOnInit()
  }


  export() {

    const UsersList = new FormData();
    if (this.searchItem.item) {
      UsersList.append('searchItem', this.searchItem.item);
    }

    if (this.dateRange.start && this.dateRange.end) {
      UsersList.append('dateRange', JSON.stringify(this.dateRange));
    }

    this.adminservice.export(UsersList).subscribe((res) => {
      var data = res['data']
      if(data.length <= 0){
        this.toastrService.show('Error', 'No data found', { status: 'danger' });
        return
      }

      const options = {
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: 'Admin CSV',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: 'Admin CSV'
        // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
      };

      const csvExporter = new ExportToCsv(options);

      csvExporter.generateCsv(data);
    })
  }

  checkChange() {
    this.checkedArray = []
    this.data.data.forEach((element) => {
      if (element.isChecked) {
        console.log(element)
        this.checkedArray.push(element._id)
        console.log(this.checkedArray)
      }
      else {
        console.log('in else')
        // var index = this.checkedArray.indexOf(element._id);
        // this.checkedArray.splice(index, 1);
      }
    })
    this.checkedArray = this.checkedArray.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    if (this.checkedArray.length === this.data.data.length) {
      this.checkAll = true
    }
    else {
      this.checkAll = false
    }
    console.log(this.checkedArray)
  }

  checkAllChange() {
    if (this.checkAll) {
      this.data.data.forEach((element) => {
        element.isChecked = true
        this.checkedArray.push(element._id)
      })
    }
    else {
      this.data.data.forEach((element) => {
        element.isChecked = false
      })
      this.checkedArray = []
    }
  }

  statusChange(status) {
    if (confirm('Are you sure?')) {
      console.log(this.checkedArray)
      const newformData = new FormData();
      newformData.append('idArray', JSON.stringify(this.checkedArray))
      newformData.append('status', status)
      this.adminservice.multiStatusChange(newformData).subscribe((res) => {
        console.log(res)
        if (res['status'] != -1) {
          this.checkAll = false
          this.ngOnInit()
          this.toastrService.show('success', res['message'], { status: 'success' });
        } else {
          this.checkAll = false
          this.ngOnInit()
          this.toastrService.show('success', res['message'], { status: 'danger' });
        }
      })
    }
    else { return false }
  }

  multiDelete() {
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('idArray', JSON.stringify(this.checkedArray))
      this.adminservice.multiDelete(newformData).subscribe((res) => {
        if (res['status'] != -1) {
          this.checkAll = false
          this.ngOnInit()
          this.toastrService.show('success', res['message'], { status: 'success' });
        } else {
          this.checkAll = false
          this.ngOnInit()
          this.toastrService.show('success', res['message'], { status: 'danger' });
        }
      })
    }
    else { return false }
  }
}
