import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './@core/core.module';
import { ThemeModule } from './@theme/theme.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NbChatModule, NbDatepickerModule, NbDialogModule, NbMenuModule, NbSidebarModule, NbToastrModule, NbWindowModule, NbThemeModule, NbLayoutModule, NbCardModule, NbAutocompleteModule, } from '@nebular/theme';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Interceptor } from './my.interceptor';
import { ChartsModule } from 'ng2-charts';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ChartsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot({
      preventDuplicates: true,
      limit:3,
      duration:5000
    }),
    NbChatModule.forRoot({
      messageGoogleMapKey: 'AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY',
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    NbCardModule,
    NbAutocompleteModule,
    NgxIntlTelInputModule
  ],
  bootstrap: [AppComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
  ]
})
export class AppModule {
}
