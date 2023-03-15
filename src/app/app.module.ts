import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NZ_I18N, es_ES, en_US } from 'ng-zorro-antd/i18n';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { registerLocaleData, PathLocationStrategy, LocationStrategy } from '@angular/common';
import es from '@angular/common/locales/es';
import en from '@angular/common/locales/en';
import { AppRoutingModule } from './app-routing.module';
import { TemplateModule } from './shared/template/template.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { CommonLayoutComponent } from './layouts/common-layout/common-layout.component';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';
import { NgChartjsModule } from 'ng-chartjs';
import { ThemeConstantService } from './shared/services/theme-constant.service';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateFormComponent } from './questions/manage-forms/create-form/create-form.component';
import { ManageFormsComponent } from './questions/manage-forms/index/manage-forms.component';
import localeEs from '@angular/common/locales/es';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CreateQuestionsComponent } from './questions/manage-questions/create-questions/create-questions.component';
import { IndexQuestionsComponent } from './questions/manage-questions/index-questions/index-questions.component';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NgZorroAntdModule } from './ng-zorro-antd.module';
import { FormsModule } from '@angular/forms';
import { IndexComponentsComponent } from './questions/manage-components/index-components/index-components.component';
import { IndexSubTopicComponent } from './questions/manage-subtopic/index-sub-topic/index-sub-topic.component';
import { CreateSubTopicComponent } from './questions/manage-subtopic/create-sub-topic/create-sub-topic.component';
import { FillFormComponent } from './test-form/fill-form/fill-form.component';
import { UserProfileComponent } from './login/user-profile/user-profile.component';
import { AuthInterceptor } from './shared/auth.interceptor';
registerLocaleData(localeEs, 'es');
registerLocaleData(en);

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key])
@NgModule({
  declarations: [
    CommonLayoutComponent,
    FullLayoutComponent,
    CreateFormComponent,
    CreateQuestionsComponent,
    CreateSubTopicComponent,
    AppComponent,
    UserProfileComponent,
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NzBreadCrumbModule,
    TemplateModule,
    SharedModule,
    NgChartjsModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    FormsModule,
    NgZorroAntdModule,
  ],

  providers: [
    {
      provide: NZ_I18N,
      useFactory: (localId: string) => {
        switch (localId) {
          case 'en':
            return en_US;
          /** keep the same with angular.json/i18n/locales configuration **/
          case 'es':
            return es_ES;
          default:
            return es_ES;
        }
      },
      deps: [LOCALE_ID]
    },
    { provide: LOCALE_ID, useValue: 'es' },
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    ThemeConstantService,
    ManageFormsComponent,
    IndexQuestionsComponent,
    IndexComponentsComponent,
    IndexSubTopicComponent,
    FillFormComponent,
    { provide: NZ_ICONS, useValue: icons },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }

// AOT compilation support
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
