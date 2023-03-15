import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

import { FullLayoutComponent } from "./layouts/full-layout/full-layout.component";
import { CommonLayoutComponent } from "./layouts/common-layout/common-layout.component";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FullLayout_ROUTES } from "./shared/routes/full-layout.routes";
import { CommonLayout_ROUTES } from "./shared/routes/common-layout.routes";
import { AuthInterceptor } from './shared/auth.interceptor';
import { AuthGuard } from './services/auth.guard';
import { LoginFormComponent } from './questions/login-form/login-form.component';

const appRoutes: Routes = [

  { path: '', redirectTo: '/mintur/formulario', pathMatch: 'full' },
  {
    path: 'admin',
    canActivate:[AuthGuard],
    component: CommonLayoutComponent,
    children: CommonLayout_ROUTES
  },
  {
    path:'login', component:LoginFormComponent
  },
  {
    path: 'mintur',
    component: FullLayoutComponent,
    children: FullLayout_ROUTES
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      useHash: true
    })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
})

export class AppRoutingModule {
}
