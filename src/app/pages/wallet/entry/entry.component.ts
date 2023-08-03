import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  NbComponentStatus,
  NbDialogService,
  NbToastrService,
} from "@nebular/theme";
import { CommonService } from "app/common.service";
import { WalletService } from "../wallet.service";

@Component({
  selector: "ngx-entry",
  templateUrl: "./entry.component.html",
  styleUrls: ["./entry.component.scss"],
})
export class EntryComponent implements OnInit {
  statuses: NbComponentStatus[] = ["info"];
  items;
  data: any = {};
  searchItem = {
    item: "",
  };
  page = 1;
  type = "0";
  amount: number;
  paymentType: string;
  userId: string;
  dialogServiceRef;

  userType: string = "CUSTOMER";

  constructor(
    private common: CommonService,
    private walletService: WalletService,
    private toastrService: NbToastrService,
    private dialogService: NbDialogService
  ) {}
  ngOnInit() {
    this.getUsers("1", "");
  }

  getUsers = async (pageNo, searchItem, dateRange?, type?) => {
    this.common.showLoader();
    const UsersList = new FormData();
    UsersList.append("pageNo", pageNo);
    UsersList.append("size", "8");
    UsersList.append("searchItem", searchItem);
    UsersList.append("type", this.type);
    if (this.userType == "PROVIDER")
      this.walletService.getUserlist(UsersList).subscribe((res) => {
        this.data = res;
        this.items = Array.from({ length: res["pages"] }, (v, k) => k + 1);
        this.common.hideLoader();
      });
    else
      this.walletService.getCustomer(UsersList).subscribe((res) => {
        this.data = res;
        this.items = Array.from({ length: res["pages"] }, (v, k) => k + 1);
        this.common.hideLoader();
      });
  };

  onDeleteConfirm(event): void {
    if (window.confirm("Are you sure you want to delete?")) {
      event.confirm.resolve();
    } else {
      event.confirm.reject();
    }
  }

  pageChanged(event) {
    this.page = event;
    this.getUsers(event, "");
  }
  searchEvent(searchItem) {
    this.getUsers("1", searchItem);
  }
  filterChange(event) {
    this.getUsers("1", "");
  }

  reset() {
    this.searchItem = { item: "" };
    this.type = "0";
    this.ngOnInit();
  }

  credit(dialog: TemplateRef<any>, type, userId) {
    this.paymentType = "";
    this.amount = null;
    this.dialogServiceRef = this.dialogService.open(dialog, {
      context: "this is some additional data passed to dialog",
    });
    this.paymentType = type;
    this.userId = userId;
  }

  save() {
    if (this.amount < 0) {
      this.toastrService.show("error", "Invalid Amount", { status: "danger" });
      return;
    }
    if (confirm("Are you sure?")) {
      const data = new FormData();
      data.append("amount", String(this.amount));
      data.append("paymentType", this.paymentType);
      data.append("userId", this.userId);
      this.walletService.updatewallet(data).subscribe((res) => {
        if (res["status"] == 1) {
          this.toastrService.show("success", res["message"], {
            status: "success",
          });
          console.log(this.page);
          this.getUsers(this.page, "");
        } else {
          this.toastrService.show("error", res["message"], {
            status: "danger",
          });
        }
      });
    } else {
      return false;
    }
    this.dialogServiceRef.close();
    this.paymentType = "";
    this.amount = null;
  }

  changeTab(index) {
    this.userType = index.tabTitle;
    this.ngOnInit();
  }
}
