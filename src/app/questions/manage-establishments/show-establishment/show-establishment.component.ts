import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Establishment } from 'src/app/test-form/establishment';
import { EstablishmentService } from 'src/app/test-form/establishment.service';
import { ThemeConstantService } from 'src/app/shared/services/theme-constant.service';
@Component({
  selector: 'app-show-establishment',
  templateUrl: './show-establishment.component.html',
  styleUrls: ['./show-establishment.component.css']
})
export class ShowEstablishmentComponent implements OnInit {

  @Input() InputData: any;

  establishment:Establishment;
  forms:any[]=[];
  results:any[]=[];

  constructor(private modalService:NzModalService,
    private message: NzMessageService,
    private establishmentService: EstablishmentService
     ) { }

  ngOnInit(): void {
    if(this.InputData){

      try{
        this.establishmentService.find(this.InputData).subscribe((data: Establishment) => {
          this.establishment=data;
          this.results=this.establishment['results'].filter(element=>element);
        }, err => {
          this.message.create('error', `Error: ${err}`);
        });
      }catch(e){
        this.message.create('error', `Error ${e}`);

      }

    }
  }
}
