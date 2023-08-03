import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminAddComponent } from './admin/admin-add/admin-add.component';
import { AdminListComponent } from './admin/admin-list/admin-list.component';
import { ServiceProviderListComponent } from './service-provider/service-provider-list/service-provider-list.component';
import { ServiceProviderAddComponent } from './service-provider/service-provider-add/service-provider-add.component';
import { CustomerListComponent } from './customer/customer-list/customer-list.component';
import { CustomerAddComponent } from './customer/customer-add/customer-add.component';
import { CategorylistComponent } from './category/categorylist/categorylist.component';
import { CategoryaddComponent } from './category/categoryadd/categoryadd.component';
import { SubcategorylistComponent } from './category/subcategorylist/subcategorylist.component';
import { SubcategoryaddComponent } from './category/subcategoryadd/subcategoryadd.component';
import { LoginComponent } from './auth/login/login.component';
import { ProfileComponent } from './auth/profile/profile.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { FaqlistComponent } from './faq/faqlist/faqlist.component';
import { FaqaddComponent } from './faq/faqadd/faqadd.component';

import { AuthGuard } from 'app/auth.guard';
import { EmaillistComponent } from './email/emaillist/emaillist.component';
import { EmailaddComponent } from './email/emailadd/emailadd.component';
import { TandcComponent } from './cms/tandc/tandc.component';
import { TandcaddComponent } from './cms/tandcadd/tandcadd.component';
import { GuideComponent } from './cms/guide/guide.component';
import { GuideaddComponent } from './cms/guideadd/guideadd.component';
import { ForgetPasswordComponent } from './auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { BookingaddComponent } from './booking/bookingadd/bookingadd.component';
import { BookinglistComponent } from './booking/bookinglist/bookinglist.component';
import { WalletComponent } from './wallet/wallet/wallet.component';
import { EntryComponent } from './wallet/entry/entry.component';
import { TransactionComponent } from './wallet/transaction/transaction.component';
import { GlobalsettingComponent } from './cms/globalsetting/globalsetting.component';
import { ChatComponent } from './chat/chat/chat.component';
import { CityComponent } from './cms/city/city.component';
import { CityaddComponent } from './cms/cityadd/cityadd.component';
import { QualificationComponent } from './cms/qualification/qualification.component';
import { QualificationaddComponent } from './cms/qualificationadd/qualificationadd.component';
import { LanguageComponent } from './cms/language/language.component';
import { LanguageaddComponent } from './cms/languageadd/languageadd.component';
import { TrainingComponent } from './cms/training/training.component';
import { TrainingaddComponent } from './cms/trainingadd/trainingadd.component';
import { SlideraddComponent } from './cms/slideradd/slideradd.component';
import { SliderComponent } from './cms/slider/slider.component';
import { PaymentComponent } from './payment/payment.component';
import { BankAccountComponent } from './service-provider/bank-account/bank-account.component';
import { PromoCodeComponent } from './promo-code/promo-code/promo-code.component';
import { PromoCodeAddComponent } from './promo-code/promo-code-add/promo-code-add.component';
import { AccessDeniedComponent } from './access-denied/access-denied.component';
import { BookingcreateComponent } from './booking/bookingcreate/bookingcreate.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'reset_password/:slug', component: ResetPasswordComponent },
  { path: 'payment', component: PaymentComponent },
  {
    path: '',
    component: PagesComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },

      { path: 'admin', component: AdminListComponent, canActivate: [AuthGuard] },
      { path: 'admin/add', component: AdminAddComponent, canActivate: [AuthGuard] },
      { path: 'admin/view/:id', component: AdminAddComponent, canActivate: [AuthGuard] },

      { path: 'service-provider', component: ServiceProviderListComponent, canActivate: [AuthGuard] },
      { path: 'service-provider/add', component: ServiceProviderAddComponent, canActivate: [AuthGuard] },
      { path: 'service-provider/view/:id', component: ServiceProviderAddComponent, canActivate: [AuthGuard] },
      { path: 'service-provider/bank-account/:id', component: BankAccountComponent, canActivate: [AuthGuard] },

      { path: 'customer', component: CustomerListComponent, canActivate: [AuthGuard] },
      { path: 'customer/add', component: CustomerAddComponent, canActivate: [AuthGuard] },
      { path: 'customer/view/:id', component: CustomerAddComponent, canActivate: [AuthGuard] },

      { path: 'category', component: CategorylistComponent, canActivate: [AuthGuard] },
      { path: 'category/add', component: CategoryaddComponent, canActivate: [AuthGuard] },
      { path: 'category/view/:id', component: CategoryaddComponent, canActivate: [AuthGuard] },

      { path: 'subcategory', component: SubcategorylistComponent, canActivate: [AuthGuard] },
      { path: 'subcategory/add', component: SubcategoryaddComponent, canActivate: [AuthGuard] },
      { path: 'subcategory/view/:id', component: SubcategoryaddComponent, canActivate: [AuthGuard] },

      { path: 'faq', component: FaqlistComponent, canActivate: [AuthGuard] },
      { path: 'faq/add', component: FaqaddComponent, canActivate: [AuthGuard] },
      { path: 'faq/view/:id', component: FaqaddComponent, canActivate: [AuthGuard] },

      { path: 'email', component: EmaillistComponent, canActivate: [AuthGuard] },
      { path: 'email/add', component: EmailaddComponent, canActivate: [AuthGuard] },
      { path: 'email/view/:id', component: EmailaddComponent, canActivate: [AuthGuard] },

      { path: 'cms', component: TandcComponent, canActivate: [AuthGuard] },
      { path: 'cms/add', component: TandcaddComponent, canActivate: [AuthGuard] },
      { path: 'cms/view/:id', component: TandcaddComponent, canActivate: [AuthGuard] },

      { path: 'guide', component: GuideComponent, canActivate: [AuthGuard] },
      { path: 'guide/add', component: GuideaddComponent, canActivate: [AuthGuard] },
      { path: 'guide/view/:id', component: GuideaddComponent, canActivate: [AuthGuard] },

      { path: 'booking', component: BookinglistComponent, canActivate: [AuthGuard] },
      { path: 'booking/add', component: BookingcreateComponent, canActivate: [AuthGuard] },
      { path: 'booking/view/:id', component: BookingaddComponent, canActivate: [AuthGuard] },

      { path: 'wallet', component: WalletComponent, canActivate: [AuthGuard] },
      { path: 'wallet/entry', component: EntryComponent, canActivate: [AuthGuard] },
      { path: 'wallet/transaction/:id', component: TransactionComponent, canActivate: [AuthGuard] },

      { path: 'globalsetting', component: GlobalsettingComponent, canActivate: [AuthGuard] },

      { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },

      // Simple Crud
      { path: 'city', component: CityComponent, canActivate: [AuthGuard] },
      { path: 'city/add', component: CityaddComponent, canActivate: [AuthGuard] },
      { path: 'city/view/:id', component: CityaddComponent, canActivate: [AuthGuard] },

      { path: 'qualification', component: QualificationComponent, canActivate: [AuthGuard] },
      { path: 'qualification/add', component: QualificationaddComponent, canActivate: [AuthGuard] },
      { path: 'qualification/view/:id', component: QualificationaddComponent, canActivate: [AuthGuard] },

      { path: 'language', component: LanguageComponent, canActivate: [AuthGuard] },
      { path: 'language/add', component: LanguageaddComponent, canActivate: [AuthGuard] },
      { path: 'language/view/:id', component: LanguageaddComponent, canActivate: [AuthGuard] },

      { path: 'training', component: TrainingComponent, canActivate: [AuthGuard] },
      { path: 'training/add', component: TrainingaddComponent, canActivate: [AuthGuard] },
      { path: 'training/view/:id', component: TrainingaddComponent, canActivate: [AuthGuard] },

      { path: 'slider', component: SliderComponent, canActivate: [AuthGuard] },
      { path: 'slider/add', component: SlideraddComponent, canActivate: [AuthGuard] },
      { path: 'slider/view/:id', component: SlideraddComponent, canActivate: [AuthGuard] },

      { path: 'promocode', component: PromoCodeComponent, canActivate: [AuthGuard] },
      { path: 'promocode/add', component: PromoCodeAddComponent, canActivate: [AuthGuard] },
      { path: 'promocode/view/:id', component: PromoCodeAddComponent, canActivate: [AuthGuard] },

      { path: 'access-denied', component: AccessDeniedComponent, canActivate: [AuthGuard] },
      // Simple Crud
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
