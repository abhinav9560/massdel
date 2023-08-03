import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { AdminAddComponent } from './admin/admin-add/admin-add.component';
import { AdminListComponent } from './admin/admin-list/admin-list.component';
import { ServiceProviderListComponent } from './service-provider/service-provider-list/service-provider-list.component';
import { ServiceProviderAddComponent } from './service-provider/service-provider-add/service-provider-add.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { CustomerAddComponent } from './customer/customer-add/customer-add.component';
import { SharedModule } from 'app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategorylistComponent } from './category/categorylist/categorylist.component';
import { CategoryaddComponent } from './category/categoryadd/categoryadd.component';
import { SubcategorylistComponent } from './category/subcategorylist/subcategorylist.component';
import { SubcategoryaddComponent } from './category/subcategoryadd/subcategoryadd.component';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { FaqlistComponent } from './faq/faqlist/faqlist.component';
import { FaqaddComponent } from './faq/faqadd/faqadd.component';
import { EmaillistComponent } from './email/emaillist/emaillist.component';
import { EmailaddComponent } from './email/emailadd/emailadd.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { GuideComponent } from './cms/guide/guide.component';
import { GuideaddComponent } from './cms/guideadd/guideadd.component';
import { TandcComponent } from './cms/tandc/tandc.component';
import { TandcaddComponent } from './cms/tandcadd/tandcadd.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { BookinglistComponent } from './booking/bookinglist/bookinglist.component';
import { BookingaddComponent } from './booking/bookingadd/bookingadd.component';
import { WalletComponent } from './wallet/wallet/wallet.component';
import { EntryComponent } from './wallet/entry/entry.component';
import { NbDialogModule } from '@nebular/theme';
import { TransactionComponent } from './wallet/transaction/transaction.component';
import { GlobalsettingComponent } from './cms/globalsetting/globalsetting.component';
import { NotificationComponent } from './notification/notification.component';
import { ChatComponent } from './chat/chat/chat.component';
import { ChartsModule } from 'ng2-charts';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CityComponent } from './cms/city/city.component';
import { CityaddComponent } from './cms/cityadd/cityadd.component';
import { QualificationComponent } from './cms/qualification/qualification.component';
import { QualificationaddComponent } from './cms/qualificationadd/qualificationadd.component';
import { LanguageComponent } from './cms/language/language.component';
import { LanguageaddComponent } from './cms/languageadd/languageadd.component';
import { TrainingComponent } from './cms/training/training.component';
import { TrainingaddComponent } from './cms/trainingadd/trainingadd.component';

import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { SliderComponent } from './cms/slider/slider.component';
import { SlideraddComponent } from './cms/slideradd/slideradd.component';
import { PaymentComponent } from './payment/payment.component';
import { BankAccountComponent } from './service-provider/bank-account/bank-account.component';
import { PromoCodeComponent } from './promo-code/promo-code/promo-code.component';
import { PromoCodeAddComponent } from './promo-code/promo-code-add/promo-code-add.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { BookingcreateComponent } from './booking/bookingcreate/bookingcreate.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularEditorModule,
    ChartsModule,
    SharedModule,
    NbDialogModule.forChild(),
    NgxIntlTelInputModule
  ],
  declarations: [
    PagesComponent,
    LoginComponent,
    ForgetPasswordComponent,
    AdminAddComponent,
    AdminListComponent,
    ServiceProviderListComponent,
    ServiceProviderAddComponent,
    CustomerListComponent,
    CustomerAddComponent,
    CategorylistComponent,
    CategoryaddComponent,
    SubcategorylistComponent,
    SubcategoryaddComponent,
    ProfileComponent,
    ChangePasswordComponent,
    FaqlistComponent,
    FaqaddComponent,
    EmaillistComponent,
    EmailaddComponent,
    GuideComponent,
    GuideaddComponent,
    TandcComponent,
    TandcaddComponent,
    ResetPasswordComponent,
    BookinglistComponent,
    BookingaddComponent,
    DashboardComponent,
    WalletComponent,
    EntryComponent,
    TransactionComponent,
    GlobalsettingComponent,
    NotificationComponent,
    ChatComponent,
    CityComponent,
    CityaddComponent,
    QualificationComponent,
    QualificationaddComponent,
    LanguageComponent,
    LanguageaddComponent,
    TrainingComponent,
    TrainingaddComponent,
    SliderComponent,
    SlideraddComponent,
    PaymentComponent,
    BankAccountComponent,
    PromoCodeComponent,
    PromoCodeAddComponent,
    AccessDeniedComponent,
    BookingcreateComponent,
  ],
})
export class PagesModule {
}
