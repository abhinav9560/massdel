import { Component, OnInit } from '@angular/core';
import { NbComponentStatus, NbToastrService } from '@nebular/theme';
import { CommonService } from 'app/common.service';
import { CategoryService } from '../category.service';

import { ExportToCsv } from 'export-to-csv';

@Component({
  selector: 'ngx-categorylist',
  templateUrl: './categorylist.component.html',
  styleUrls: ['./categorylist.component.scss']
})
export class CategorylistComponent implements OnInit {
  statuses: NbComponentStatus[] = ['info'];
  items
  data: any = {
  }
  searchItem = {
    item: '',
  };
  dateRange
  checkedArray = []
  checkAll: Boolean = false
  constructor(private common: CommonService, private categoryService: CategoryService, private toastrService: NbToastrService) {

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
    this.categoryService.get(UsersList).subscribe((res) => {
      this.data = res;
      this.items = Array.from({ length: res['pages'] }, (v, k) => k + 1);
      this.common.hideLoader()
    })
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure?')) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  InactiveUser = async (Id, indexIs) => {
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('id', Id);
      await this.categoryService.inactive(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', response['message'],  { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }

  ActiveUser = async (Id, indexIs) => {
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('id', Id);
      await this.categoryService.active(newformData).subscribe((response) => {
        if (response['status'] == 1) {
          this.toastrService.show('success', response['message'], { status: 'success' });
          this.ngOnInit()
        } else {
          this.toastrService.show('danger', response['message'], { status: 'danger' });
        }
      });
    } else {
      return false;
    }
  }

  deleteUser = async (Id, Indexis) => {
    if (confirm('Are you sure?')) {
      const newformData = new FormData();
      newformData.append('user_id', Id);

      await this.categoryService.delete(newformData).subscribe((response) => {
        if (response['status'] == 1) {

          if (Indexis !== -1) {
            this.data.data.splice(Indexis, 1);
            this.toastrService.show('success', response['message'], { status: 'success' });
          } else {
            this.toastrService.show('Error', response['message'], { status: 'danger' });
          }


        } else {
          this.toastrService.show('danger', response['message'], { status: 'danger' });
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


  export() {

    const UsersList = new FormData();
    if (this.searchItem.item) {
      UsersList.append('searchItem', this.searchItem.item);
    }

    this.categoryService.export(UsersList).subscribe((res) => {
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
        title: 'Category CSV',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: 'Category CSV'
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
      this.categoryService.multiStatusChange(newformData).subscribe((res) => {
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
      this.categoryService.multiDelete(newformData).subscribe((res) => {
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
