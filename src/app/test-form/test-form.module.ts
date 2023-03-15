import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { TestFormRoutingModule } from './test-form-routing.module';
import { FillFormComponent } from './fill-form/fill-form.component';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzLayoutModule } from 'ng-zorro-antd/layout'
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzAffixModule } from 'ng-zorro-antd/affix';
import { NzSpinModule } from 'ng-zorro-antd/spin';
const antdModule= [
  NzCardModule,
  NzSkeletonModule,
  NzAvatarModule,
  NzPaginationModule,
  NzDividerModule,
  NzButtonModule,
  NzListModule,
  NzTableModule,
  NzRadioModule,
  NzRateModule,
  NzTabsModule,
  NzTagModule,
  NzFormModule,
  NzDatePickerModule,
  NzSelectModule,
  NzSwitchModule,
  NzUploadModule,
  NzToolTipModule,
  NzModalModule,
  NzMessageModule,
  NzInputModule,
  NzCheckboxModule,
  NzProgressModule,
  NzLayoutModule,
  NzCarouselModule,
  NzStepsModule,
  NzAffixModule,
  NzSpinModule
]

@NgModule({
  declarations: [FillFormComponent],
  imports: [
    CommonModule,
    TestFormRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    ...antdModule
  ]
})
export class TestFormModule { }
