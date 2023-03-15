import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FillFormComponent } from './fill-form/fill-form.component';

const routes: Routes = [
  {
    path:'formulario',
    component: FillFormComponent,
    data:{
      title:'Formulario MinTur'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestFormRoutingModule { }
