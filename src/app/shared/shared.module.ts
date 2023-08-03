import { NgModule } from "@angular/core";
import {
  NbMenuModule,
  NbLayoutModule,
  NbChatModule,
  NbTabsetModule,
  NbAutocompleteModule,
} from "@nebular/theme";
import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule,
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbFormFieldModule,
} from "@nebular/theme";
import { ThemeModule } from "../@theme/theme.module";
import { NbAuthModule } from "@nebular/auth";
import { NgxPaginationModule } from "ngx-pagination";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";

@NgModule({
  declarations: [],
  imports: [
    ThemeModule,
    NbMenuModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbDatepickerModule,
    NbIconModule,
    NbInputModule,
    NbRadioModule,
    NbSelectModule,
    NbUserModule,
    NbFormFieldModule,
    NbAuthModule,
    NgxPaginationModule,
    NbLayoutModule,
    GooglePlaceModule,
    NbChatModule,
    NbTabsetModule,
    NbAutocompleteModule,
  ],
  exports: [
    ThemeModule,
    NbMenuModule,
    NbActionsModule,
    NbButtonModule,
    NbCardModule,
    NbCheckboxModule,
    NbDatepickerModule,
    NbIconModule,
    NbInputModule,
    NbRadioModule,
    NbSelectModule,
    NbUserModule,
    NbFormFieldModule,
    NbAuthModule,
    NgxPaginationModule,
    NbLayoutModule,
    GooglePlaceModule,
    NbChatModule,
    NbTabsetModule,
    NbAutocompleteModule,
  ],
})
export class SharedModule {}
