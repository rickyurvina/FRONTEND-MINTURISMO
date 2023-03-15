import { Component, OnInit } from '@angular/core';
import { Establishment } from 'src/app/test-form/establishment';
import { EstablishmentService } from 'src/app/test-form/establishment.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ShowEstablishmentComponent } from './show-establishment/show-establishment.component';
import pdfMake from 'pdfmake/build/pdfmake';
import * as XLSX from 'xlsx';
import { Result } from 'src/app/test-form/result';
import { QuestionService } from '../manage-questions/question.service';
import { Question } from '../manage-questions/question';
import { Component as Comp } from '../manage-components/component';
import { SubTopic } from '../manage-subtopic/sub-topic';

import { Router } from '@angular/router';
import { TokenService } from 'src/app/shared/token.service';
import { AuthStateService } from 'src/app/shared/auth-state.service';
@Component({
  selector: 'app-manage-establishments',
  templateUrl: './manage-establishments.component.html',
  styleUrls: ['./manage-establishments.component.css']
})
export class ManageEstablishmentsComponent {
  establishments: Establishment[] = [];
  establishmentsExcel: Establishment[] = [];

  componentsExcel: Comp[];
  subTopicsExcel: SubTopic[];
  questionsChart: any[] = []
  forms: any[];
  result: Result;
  results: Result[] = [];
  questionsExcel: Question[] = [];
  isLoadingDownloadExcel = false;
  isLoadingDownloadPdf = false;
  isLoadingTable=true;

  constructor(private establishmentService: EstablishmentService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private questionsService: QuestionService,
    private translate: TranslateService,
    public router: Router,
    public token: TokenService, private auth: AuthStateService) {
    try {
      this.isLoadingTable=true;

      this.establishmentService.getAll().subscribe((data: Establishment[]) => {
        this.establishments = data;
        this.isLoadingTable=false;
      }, err => {
        if (err.error.message == 'Unauthenticated.') {
          this.signOut();
        }
        this.message.create('error', `Error: ${err}`);
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }

    try {

      this.questionsService.getAllActive().subscribe((data: any[]) => {
        this.questionsExcel = data['questions'];
        this.componentsExcel = data['components'];
        this.subTopicsExcel = data['subTopics'];
      }, err => {
        this.message.create('error', `Error: ${err}`);
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }


  signOut() {
    this.auth.setAuthState(false);
    this.token.removeToken();
    this.router.navigate(['login']);
  }

  showEstablishment(id) {
    try {
      const modal = this.modalService.create({
        nzTitle: 'Ver Información',
        nzContent: ShowEstablishmentComponent,
        nzComponentParams: {
          InputData: id,
        },
        nzFooter: null,
        nzWidth: '1000px',
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }

  async downloadPdf(id, action = 'download') {

    try {
      this.isLoadingDownloadPdf = true;

      this.establishmentService.chargeResultsEstablishment(id).subscribe((data: Establishment) => {
        var establishment = data['establishment'];
        var form = data['forms'];
        var components = data['components'];
        var subTopics = data['subTopics'];
        var questions = data['questions']
        let docDefinition = {
          pageSize: 'A4',
          pageOrientation: 'landscape',
          pageMargins: [40, 60, 40, 60],
          header: {
            columns: [
              {
                width: '*',
                table: {
                  headerRows: 1,
                  body: [
                    [
                      {
                        text: form[0]['resultable']['name'],
                        alignment: 'center',
                      },
                    ],
                    [
                      { text: form[0]['resultable']['description'], bold: true },
                    ],
                  ],
                }
              },
            ],
          },
          content: [
            {
              columns: [
                {
                  text: `Fecha: ${new Date().toLocaleString()}\n`,
                  alignment: 'right',
                },

              ],
            },
            {
              aligment: 'center',
              text: '  ',
            },
            {
              aligment: 'center',
              text: '  ',
            },
            {
              columns: [
                {

                  table: {
                    headerRows: 1,
                    body: [
                      [
                        {
                          text: 'Detalles Establecimiento',
                          alignment: 'center',
                          fillColor: '#26506d',
                          color: 'white',
                          colSpan: 2,
                        },
                        {},
                      ],
                      [
                        { text: 'Nombre', bold: true },
                        {
                          text: establishment['name']
                        },
                      ],
                      [
                        { text: 'Correo', bold: true },
                        {
                          text: establishment['email']
                        },
                      ],
                      [
                        { text: 'Nombre establecimiento', bold: true },
                        {
                          text: establishment['company']
                        },
                      ],
                      [
                        { text: 'RUC', bold: true },
                        {
                          text: establishment['ruc']
                        },
                      ],
                      [
                        { text: 'Tipo', bold: true },
                        {
                          text: establishment['type_of_taxpayer']
                        },
                      ],
                      [
                        { text: 'Dirección', bold: true },
                        {
                          text: establishment['direction']
                        },
                      ],

                    ],
                  },
                }
              ],
            },
            {
              aligment: 'center',
              text: '  ',
            },

            {
              style: 'tableExample',
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'Formulario',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                    {
                      text: 'Calificación',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                  ],
                  [
                    {
                      text: form[0]['resultable']['name'],
                      alignment: 'center',
                    },
                    {
                      text: (form[0]['score'] * 1).toFixed(2),
                      alignment: 'center',
                    },
                  ],

                ],
              },
            },
            {
              aligment: 'center',
              text: '  ',
            },

            {
              style: 'tableExample',
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'Componente',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                    {
                      text: 'Calificación',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                  ],
                  ...components.map((p) => [
                    p['resultable']['name'],
                    p['score'],
                  ]),

                ],
              },
            },
            {
              aligment: 'center',
              text: '  ',
            },
            {
              style: 'tableExample',
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 1,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'Sub Tema',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                    {
                      text: 'Calificación',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                  ],
                  ...subTopics.map((p) => [
                    p['resultable']['name'],
                    p['score'],
                  ]),

                ],
              },
            },
            {
              aligment: 'center',
              text: '  ',
            },
            {
              style: 'tableExample',
              table: {
                layout: 'lightHorizontalLines',
                headerRows: 2,
                widths: ['auto', 'auto'],
                body: [
                  [
                    {
                      text: 'A CONTINUACIÓN SE MUESTRA LA IMPORTANCIA Y MEDIOS DE VERIFICACIÓN DE LAS PREGUNTAS CON BAJA CALIFICACIÓN',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                      colSpan: 2,
                    }, {}
                  ],
                  [
                    {
                      text: 'Pregunta',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                    {
                      text: 'Calificación',
                      alignment: 'center',
                      fillColor: '#26506d',
                      color: 'white',
                    },
                  ],
                  ...questions.map((p) =>
                    [
                      p['resultable']['name'],
                      p['resultable']['type'] == 'relacionada' ?
                        ((p['score'] != null) ? (p['score'] / 10).toFixed(2) : '')

                        : p['resultable']['type'] == 'una_opcion' ?
                          ((p['score'] != null) ? (p['score'] == '0' ? p['score'] : (p['score'] / p['score']).toFixed(0)) : '')

                          : p['resultable']['type'] == 'si_no' ?
                            (p['score'] != null ? (p['score'] == '1' ? 'Si' : 'No') : '')

                            : (p['resultable']['type'] == 'informativa') ?

                              (p['score'] != null ? p['answer'] : '')
                              : p['score'] != null ? p['score'] : ''
                    ]),
                ],
              },
            },
          ],
          styles: {
            table: {
              bold: true,
              fontSize: 10,
              alignment: 'center',
              decorationColor: 'red',
            },
            sectionHeader: {
              bold: true,
              decoration: 'underline',
              fontSize: 14,
              margin: [0, 15, 0, 15],
            },
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            subheader: {
              fontSize: 16,
              bold: true,
              margin: [0, 10, 0, 5],
            },
            tableExample: {
              margin: [0, 5, 0, 15],
            },
            tableOpacityExample: {
              margin: [0, 5, 0, 15],
              fillColor: 'blue',
              fillOpacity: 0.3,
            },
            tableHeader: {
              bold: true,
              fontSize: 13,
              color: 'red',
              background: 'black',
            },
          },
        };
        if (action === 'download') {
          pdfMake.createPdf(docDefinition).download(`Evaluacion${establishment['name']}.pdf`);
          pdfMake.createPdf(docDefinition).print();
        }
        this.isLoadingDownloadPdf = false;

      }, err => {
        this.message.create('error', `Error: al cargar la data para la descarga`);
      });
    } catch (e) {
      this.message.create('error', `Error: al descargar`);
    }
  }


  downloadExcel() {
    try {
      this.isLoadingDownloadExcel = true;

      try {
        var dataArr = [];

        dataArr.push([
          'Código',
          'Creado el',
          'Nombre',
          'Porcentaje',
          'Correo',
          'RUC',
          'Empresa',
          'Tipo',
          'Año',
          '# Registro',
          'Provincia',
          'Cantón',
          'Parroquia',
          'Formulario',
        ],
        )

        this.componentsExcel.forEach(function (item) {
          dataArr[0].push(item.name)
        })
        this.subTopicsExcel.forEach(function (item) {
          dataArr[0].push(item.name)
        })
        this.questionsExcel.forEach(function (item) {
          dataArr[0].push(item.code)
          if (item['children'].length > 0) {
            item['children'].forEach(function (child) {
              dataArr[0].push(child.code)
            })
          }
        })

        this.establishmentService.getAllForExcel().subscribe((data: Establishment[]) => {
          this.establishmentsExcel = data;
          var _questions = this.questionsExcel

          this.establishmentsExcel.forEach(function (item, index) {
            let form = item.results.find(element => element['resultable_type'] == "App\\Models\\Forms\\Form")

            dataArr.push([
              item.code,
              item['created_at'],
              item.name,
              item.progress,
              item.email,
              item.ruc,
              item.company,
              item.type_of_taxpayer,
              item.start_year_operations,
              item.register_number ? item.register_number : 'NaN',
              item['province_location']['description'],
              item['canton_location']['description'],
              item['location_parrish']['description'],
              form.score
            ])

            let components = item.results.filter(element => element['resultable_type'] == "App\\Models\\Forms\\Component")
            let subTopics = item.results.filter(element => element['resultable_type'] == "App\\Models\\Forms\\SubTopic")
            components.forEach(function (component) {
              dataArr[index + 1].push(component.score)
            })

            subTopics.forEach(function (subTopic) {
              dataArr[index + 1].push(subTopic.score)
            })

            _questions.forEach(function (ques) {
              dataArr[index + 1].push(ques.code)
              if (ques['children'].length > 0) {
                ques['children'].forEach(function (child) {
                  dataArr[index + 1].push(child.code)
                })
              }
            })
            item.results.forEach(function (result) {
              var score;
              if (result.resultable_type == "App\\Models\\Forms\\Question") {
                let quest = dataArr[index + 1].find(item => item == result.resultable.code)
                if (result['resultable']['type'] == 'relacionada') {
                  score = result['score'] != null ? (result['score'] / 10).toFixed(2) : ''
                } else if (result['resultable']['type'] == 'una_opcion') {
                  score = result['score'] != null ? (result['score'] == '0' ? result['score'] : (result['score'] / result['score']).toFixed(0)) : ''
                } else if (result['resultable']['type'] == 'si_no') {
                  score = result['score'] != null ? (result['score'] == '1' ? 'Si' : 'No') : '';
                } else if (result['resultable']['type'] == 'informativa') {
                  score = result['score'] != null ? result['answer'] : '';
                } else {
                  score = result['score'] != null ? result['score'] : ''
                }
                if (quest != undefined) {
                  var _index = dataArr[index + 1].indexOf(quest);
                  dataArr[index + 1][_index] = score;
                }
              }
            })

            dataArr[index + 1].forEach(function (element) {
              let rest = dataArr[0].find(item => item == element)
              var index_ = dataArr[index + 1].indexOf(rest);
              dataArr[index + 1][index_] = 'NaN';
            })
          })
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataArr, {
            skipHeader: true,
          });
          const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };

          XLSX.writeFile(workbook, 'resultados_establecimientos.xlsx');
          this.isLoadingDownloadExcel = false;

        }, err => {
          this.message.create('error', `Error: ${err}`);
        });
      } catch (e) {
        this.message.create('error', `Error ${e}`);
      }

    } catch (e) {
      this.message.create('error', `Error: al descargar el archivo excel`);
    }
  }

  deleteEstablishment(id): void {
    try {
      this.modalService.confirm({
        nzTitle: this.translate.instant('general.seguro_desea_eliminar'),
        nzContent: this.translate.instant('general.modal_se_cierra'),
        nzOnOk: () => {
          try {
            this.establishmentService.destroy(id).subscribe(res => {
              this.establishments = this.establishments.filter(item => item.id !== id);
              this.message.create('success', `Se ha eliminado correctamente`);
            }, err => {
              this.message.create('error', `Error: ${err}`);
            })
          } catch (e) {
            this.message.create('error', `Error: ${e}`);
          }
        }
      });
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }

}
