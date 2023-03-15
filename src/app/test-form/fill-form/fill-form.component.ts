import {
  Component, OnInit, AfterViewChecked
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormService } from 'src/app/questions/manage-forms/form.service';
import { Form } from 'src/app/questions/manage-forms/form';
import { TranslateService } from '@ngx-translate/core';
import { Establishment } from '../establishment';
import { EstablishmentService } from '../establishment.service';
import { LocalService } from 'src/app/services/local.service';
import { SubTopic } from 'src/app/questions/manage-subtopic/sub-topic';
import { Question } from 'src/app/questions/manage-questions/question';
import * as echarts from 'echarts';
import { Component as Comp } from 'src/app/questions/manage-components/component';
import { EstablishmentType } from '../establishment-type';
import { EstablishmentTypeService } from '../establishment-type.service';
import { ResultsService } from '../results.service';
import { GeographichClassifierService } from 'src/app/services/geographich-classifier.service';
import { GeographichClassifier } from 'src/app/services/geographich-classifier';
import { NzModalService } from 'ng-zorro-antd/modal';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-fill-form',
  templateUrl: './fill-form.component.html',
  styleUrls: ['./fill-form.component.css']
})

export class FillFormComponent implements OnInit, AfterViewChecked {


  selectedIndexComponent = 0;
  establishmentForm: FormGroup;
  establishmentFormUpdate: FormGroup;
  form: Form;
  formDisplay: Form;
  formDisplayChart: Form;

  emailEstablishment: string;
  establishment: Establishment;
  establishmentInitial: Establishment;
  index = 0;
  indexTabs = 0;

  subTopic: SubTopic;
  subTopics: SubTopic[] = [];
  subTopicsSteps: SubTopic[] = [];
  subTopicsCharts: SubTopic[] = [];
  components: Comp[] = [];
  componentsCharts: Comp[] = [];
  questions: Question[] = [];
  questionsSteps: Question[] = [];
  questionsStepsValidate: Question[] = [];

  questionsChart: Question[] = [];
  questionsChartDisplay: Question[] = [];

  establishmentTypes: EstablishmentType[] = [];
  provinces: GeographichClassifier[] = [];
  cantons: GeographichClassifier[] = [];
  cantonsShow: GeographichClassifier[] = [];
  parrishes: GeographichClassifier[] = [];
  parrishesShow: GeographichClassifier[] = [];
  isLoadingNext = false;
  isLoadingPrevious = false;
  isLoadingFinish = false;
  isLoadingReset = false;
  isLoadingClose = false;
  isLoadingDownload = false;
  isLoadingStart = false;
  isLoadingNew = false;
  percentage: any
  validateForm: FormGroup;
  years: any[] = [];
  selectedSubTopic: number
  five_options = ['0', '1', '2', '3', '4', '5'];
  five_options_na = ['1', '2', '3', '4', '5', 'No Aplica'];

  five_options_frequency = ['diaria', 'semanal', 'mensual', 'semestral', 'anual', 'otra'];
  chartInstance: any;
  chartHeight = 400;
  chartFormV: any
  chartComponents: any
  constructor(private fb: FormBuilder,
    private message: NzMessageService,
    private formService: FormService,
    private translate: TranslateService,
    private establishmentService: EstablishmentService,
    public localStore: LocalService,
    private establishmentTypeService: EstablishmentTypeService,
    public resultsService: ResultsService,
    private geographicClassifierService: GeographichClassifierService,
    private modalService: NzModalService,
  ) {
    this.establishmentForm = this.fb.group({
      name: ['', [Validators.required]],
      company: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")]],
    });

    this.establishmentFormUpdate = this.fb.group({
      ruc: ['', [Validators.required, Validators.maxLength(13), Validators.minLength(13), Validators.pattern("^[0-9]*$")]],
      establishmentType: ['', [Validators.required]],
      typeOfTaxpayer: ['', [Validators.required]],
      province: ['', [Validators.required]],
      canton: ['', [Validators.required]],
      parrish: ['', [Validators.required]],
      direction: ['', [Validators.required]],
      startYearOperations: ['', [Validators.required]],
      hasRegisterTourist: ['', [Validators.required]],
      registerNumber: new FormControl(),
    });
    this.validateForm = this.fb.group({
      score: ['', []],
      type: ['', []],
      model: ['', []],
      establishment: ['', []],
      ids: ['', []]
    });
    const currentYear = new Date().getFullYear();
    const startYear = 1940;
    this.years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
    this.chargeDataInitial();
    translate.addLangs(['es', 'en']);
    translate.setDefaultLang('es');
  }

  ngAfterViewChecked() {
    this.showFormChart();
    this.showComponentsChart();
    this.showSubTopicsChart();
  }

  ngOnInit(): void {
    this.index = 0;

    if (this.localStore.getData('email') != null) {
      this.chargeData();
    } else {
      this.localStore.removeData('email');
    }
  }

  chargeDataInitial() {
    try {
      this.establishmentTypeService.getAll().subscribe((data: EstablishmentType[]) => {
        this.establishmentTypes = data;
      }, err => {
        this.message.create('error', `Error: al obtener los tipos de establecimiento`);
      });
    } catch (e) {
      this.message.create('error', `Error: al obtener los tipos de establecimiento`);
    }
    try {
      this.geographicClassifierService.getAll().subscribe((data: GeographichClassifier[]) => {
        this.provinces = data.filter(element => element['type'] == 'PROVINCE');
        this.cantons = data.filter(element => element['type'] == 'CANTON');
        this.parrishes = data.filter(element => element['type'] == 'PARISH');
      }, err => {
        this.message.create('error', `Error: al obtener el clasificador geográfico`);
      });
    } catch (e) {
      this.message.create('error', `Error: al obtener el clasificador geográfico`);
    }
    this.formService.showActiveForm().subscribe((data: Form) => {
      this.formDisplay = data;
    }, err => {
      this.message.create('error', `Error: al obtener el formulario activo`);
    });
  }

  submitForm(value: { name: string; email: string; company: string }): void {
    this.isLoadingStart = true;
    if (this.formDisplay.name) {
      try {
        this.establishmentService.create(value).subscribe(res => {
          for (const key in this.establishmentForm.controls) {
            if (this.establishmentForm.controls.hasOwnProperty(key)) {
              this.establishmentForm.controls[key].markAsDirty();
              this.establishmentForm.controls[key].updateValueAndValidity();
            }
          }
          this.localStore.saveData('email', value.email);
          this.establishmentService.showActiveEstablishmentForm(this.localStore.getData('email')).subscribe((data: Establishment) => {
            this.establishmentInitial = data;
            this.establishmentFormUpdate.setValue({
              ruc: this.establishmentInitial.ruc,
              establishmentType: this.establishmentInitial['establishment_type_id'],
              province: this.establishmentInitial.province,
              canton: this.establishmentInitial.canton,
              parrish: this.establishmentInitial.parrish,
              direction: this.establishmentInitial.direction,
              startYearOperations: this.establishmentInitial.start_year_operations,
              hasRegisterTourist: this.establishmentInitial.has_register_tourist,
              registerNumber: this.establishmentInitial.register_number,
              typeOfTaxpayer: this.establishmentInitial.type_of_taxpayer,
            })
            if (this.establishmentInitial.ruc != null) {
              this.updateCantons(this.establishmentFormUpdate.value.province)
              this.updateParrishes(this.establishmentFormUpdate.value.canton)
            }
            this.isLoadingStart = false;
          }, err => {
            this.message.create('error', `Error: al obtener el formulario inicial`);
          });
          this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
          this.establishmentForm.reset();
        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al guardar el formulario`);
      }
    } else {
      this.message.create('error', "No se puede iniciar, No existe un formulario acitvo")
    }
  }
  compareFn = (o1: any, o2: any): boolean => (o1 && o2 ? o1.id == o2.id : o1 === o2);

  updateForm(value: {
    ruc: string; establishmentType: string;
    typeOfTaxpayer: string; province: string;
    canton: string; parrish: string;
    direction: string, startYearOperations: string,
    has_register_tourist: boolean, register_number: string
  }): void {
    this.isLoadingNew = true;
    try {
      var message = "<p>Bienvenidas/os al aplicativo para evaluar el nivel de competitividad de su producto / destino turístico. Este aplicativo le permitirá conocer cuán preparado se encuentra su establecimiento para competir en el sector turístico ante las exigencias actuales del mercado con un enfoque de gestión de calidad. Para la evaluación deberá responder a 63 preguntas sobre 3 temáticas específicas:</p><p></p><ol><li>Sostenibilidad empresarial</li><li>Desarrollo turístico sostenible</li><li>Transformación digital</li></ol><p></p><p>Cada temática consta de subtemáticas que permiten abarcar todos los aspectos inherentes a la competitividad, por lo que se necesita que todas las preguntas sean respondidas con base en la realidad de su negocio. La calificación final se mostrará en una escala del 1 al 10 debidamente semaforizado, es decir que, según el resultado usted podrá conocer si su establecimiento es poco competitivo (rojo) medianamente competitivo (amarillo) o altamente competitivo (verde). De la misma forma, al final del proceso, podrá observar la importancia de mejorar en los aspectos en los que su negocio no se encuentra preparado, así como también los medios para verificar que así sea.</p><p></p><p>El formulario consta de preguntas de opción múltiple y tiene una duración estimada de 30 minutos.</p>"
      this.modalService.confirm({
        nzTitle: 'Introducción al formulario',
        nzContent: message,
        nzWidth: '850px',
        nzOnOk: () => {

          try {
            this.establishmentService.update(this.establishmentInitial.id, value).subscribe(res => {
              for (const key in this.establishmentFormUpdate.controls) {
                if (this.establishmentForm.controls.hasOwnProperty(key)) {
                  this.establishmentForm.controls[key].markAsDirty();
                  this.establishmentForm.controls[key].updateValueAndValidity();
                }
              }
              this.message.create('success', this.translate.instant('mensajes.creado_exitosamente'));
              this.establishmentFormUpdate.reset();
              this.chargeData();
              this.isLoadingNew = false;
            }, err => {
              this.showErrors(err)
            });
          } catch (e) {
            this.message.create('error', `Error al actualizar el formulario`);
          }

        }
      });

    } catch (e) {
      this.message.create('error', `Error al actualizar el formulario`);
    }
  }

  showErrors(err) {
    const messagesArr = [];
    if (err.error) {
      messagesArr.push(err.error.message);
      if (err.error.errors) {
        for (const property in err.error.errors) {
          if (err.error.errors.hasOwnProperty(property)) {
            const propertyErrors: Array<string> = err.error.errors[property];
            propertyErrors.forEach(error => messagesArr.push(error));
          }
        }
      }
    }
    messagesArr.forEach(element => {
      this.message.create('error', `${element}`)
    });
  }

  saveAnswer(idQuestion: number, answer: string, value: any, type: string, numberQuestions: number = 0): void {

    if (type === 'relacionada') {
      let parentQuestion = this.questionsSteps.find(resultable => {
        return resultable.id == idQuestion;
      });
      let children = parentQuestion['resultable']['children'];
      let optionWithZero = children.find(child => child['value'] == 0);

      let existOptionWithZero = value.find(child => child == optionWithZero['id'])
      if (existOptionWithZero != undefined) {
        value = [existOptionWithZero]
      }

      try {
        this.validateForm.setValue({
          score: 1,
          type: 'relacionada',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })
        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {
          this.updateProgress()
          if (numberQuestions > 0 || existOptionWithZero != undefined) {
            this.chargeQuestionsOfSubtopic(this.localStore.getData('sub_topic_id'))
          }
        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);
      }
    }

    if (type === 'si_no') {
      try {
        this.validateForm.setValue({
          score: answer == 'si' ? 1 : 0,
          type: 'si_no',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })

        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {
          this.updateProgress()
          if (numberQuestions > 0) {
            this.chargeQuestionsOfSubtopic(this.localStore.getData('sub_topic_id'))
          }
        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);
      }
    }

    if (type === 'frecuencia_actualizacion') {
      try {
        this.validateForm.setValue({
          score: answer,
          type: 'frecuencia_actualizacion',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })
        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {
          this.updateProgress()

        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);

      }
    }

    if (type === 'informativa') {
      try {
        this.validateForm.setValue({
          score: value,
          type: 'informativa',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })

        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {

        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);
      }
    }

    if (type === 'rango_1_5') {
      try {
        this.validateForm.setValue({
          score: answer,
          type: 'rango_1_5',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })

        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {
          this.updateProgress()

        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);
      }
    }

    if (type === 'una_opcion') {
      try {
        this.validateForm.setValue({
          score: answer,
          type: 'una_opcion',
          model: "App\\Models\\Forms\\Question",
          establishment: this.establishment.id,
          ids: value
        })
        this.resultsService.update(idQuestion, this.validateForm.value).subscribe(res => {
          this.updateProgress()
        }, err => {
          this.showErrors(err)
        });

      } catch (e) {
        this.message.create('error', `Error al actualizar resultado`);
      }
    }

  }

  resetForm(): void {

    this.isLoadingReset = true;
    this.modalService.confirm({
      nzTitle: 'Cerrar formularios',
      nzContent: 'Si da click en Aceptar regresará al formulario de inicio.',
      nzWidth: '850px',
      nzOnOk: () => {
        this.localStore.removeData('idEstablishment');
        this.localStore.removeData('intent_id');
        this.localStore.removeData('sub_topic_id');
        this.localStore.removeData('email');
        this.isLoadingReset = false;

        this.reloadPage();
      }
    });
  }

  resetData() {
    this.localStore.removeData('idEstablishment');
    this.localStore.removeData('intent_id');
    this.localStore.removeData('sub_topic_id');
    this.localStore.removeData('email');
    this.reloadPage();
  }

  selectStep(id: number, index: number): void {

    let idEstablishment = this.localStore.getData('idEstablishment');
    let intentId = this.localStore.getData('intent_id');
    this.establishmentService.showQuestionsOfSubtopicValidate(this.localStore.getData('sub_topic_id'), idEstablishment, intentId)
      .subscribe((data: Establishment) => {
        const questionWithOutScore = data['questions'].find(
          element => element['score'] == null
        )
        if (!questionWithOutScore || index < this.index) {
          this.index = index;
          this.chargeQuestionsOfSubtopic(id)
          window.scrollTo(-10, -10);

        } else {
          try {
            var message = "<p>Le restan preguntas por responder</p>"
            this.modalService.confirm({
              nzTitle: 'No puede continuar',
              nzContent: message,
              nzWidth: '450px',
            });
          } catch (e) {
            this.message.create('error', `Error ${e}`);
          }
        }
      }, err => {
        this.message.create('error', `Error: al obtener las preguntas para validación de continuar`);
      });
  }

  handleChagTabComponent(event) {

    if (this.components[event]) {
      this.subTopic = this.subTopics.find(element => element['resultable']['component_id'] == this.components[event]['resultable']['id'])
      this.subTopicsSteps = this.subTopics.filter(element => element['resultable']['component_id'] == this.components[event]['resultable']['id']);
      var id = this.subTopic['resultable_id'];
      this.selectedIndexComponent = event;

      this.chargeQuestionsOfSubtopic(id)
    }
    this.indexTabs = event;
    this.index = 0;
  }

  chartForm: any
  showFormChart() {

    var dom = document.getElementById('chartForm');

    if (dom) {
      this.chartForm = echarts.getInstanceByDom(dom);

      if (!this.chartForm) {

        this.chartForm = echarts.init(dom, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });

        var option = {
          series: [

            {
              type: 'gauge',
              startAngle: 180,
              endAngle: 0,
              center: ['50%', '55%'],
              radius: '90%',
              min: 0,
              max: 1,
              splitNumber: 8,
              axisLine: {
                lineStyle: {
                  width: 6,
                  color: [
                    [0.50, '#FF6E76'],
                    [0.749, '#FDDD60'],
                    [1, '#65B581']
                  ]
                }
              },
              pointer: {
                icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
                length: '12%',
                width: 20,
                offsetCenter: [0, '-40%'],
                itemStyle: {
                  color: 'inherit'
                }
              },
              axisTick: {
                length: 12,
                lineStyle: {
                  color: 'inherit',
                  width: 2
                }
              },
              splitLine: {
                length: 20,
                lineStyle: {
                  color: 'inherit',
                  width: 5
                }
              },
              axisLabel: {
                color: '#464646',
                rotate: 'tangential',
                formatter: function (value) {
                  return Math.round(value * 10) + '';
                },
              },

              detail: {
                fontSize: 30,
                offsetCenter: [0, '-10%'],
                valueAnimation: true,
                formatter: function (value) {
                  return (value * 10).toFixed(2);
                },
                color: 'inherit'
              },
              data: [
                {
                  value: (this.formDisplayChart['score'] / 10).toFixed(2),
                }
              ]
            }
          ]
        };

        if (option && typeof option === 'object') {
          this.chartForm.setOption(option);
        }
      }
    }
  }

  showComponentsChart() {

    this.componentsCharts.forEach(function (element) {
      var dom = document.getElementById('chartComponentsForm' + element['resultable_id']);
      if (dom) {
        var myChart = echarts.getInstanceByDom(dom);
        if (!myChart) {
          myChart = echarts.init(dom, null, {
            renderer: 'canvas',
            useDirtyRect: false
          });

          var option = {
            title: {
              text: element['resultable']['name'],
              left: 'center',
              button: 5,
              textStyle: {
                fontSize: 15
              },
            },
            series: [
              {
                type: 'gauge',
                axisLine: {
                  lineStyle: {
                    width: 8,
                    color: [
                      [0.50, '#FF6E76'],
                      [0.749, '#FDDD60'],
                      [1, '#65B581']
                    ]
                  }
                },
                pointer: {
                  itemStyle: {
                    color: 'inherit'
                  }
                },
                axisTick: {
                  distance: -30,
                  length: 8,
                  lineStyle: {
                    color: '#fff',
                    width: 2
                  }
                },
                splitLine: {
                  distance: -30,
                  length: 30,
                  lineStyle: {
                    color: '#fff',
                    width: 4
                  }
                },
                axisLabel: {
                  color: 'inherit',
                  distance: 15,
                  formatter: function (value) {
                    return (Math.round(value) / 10).toFixed(0) + '';
                  },
                },
                detail: {
                  fontSize: 20,
                  valueAnimation: true,
                  color: 'inherit',
                  formatter: function (value) {
                    return (value / 10).toFixed(2);
                  },
                },
                data: [
                  {
                    value: (element['score'] * 10).toFixed(2)
                  }
                ]
              }
            ]
          };

          if (option && typeof option === 'object') {
            myChart.setOption(option);
          }
        }
      }

    })
  }

  showSubTopicsChart() {
    var dom = document.getElementById('chartSubTopicsForm');
    var domResponsive = document.getElementById('chartSubTopicsFormResponsive');

    if (dom && domResponsive) {
      var myChart = echarts.getInstanceByDom(dom);
      var myChartResponsive = echarts.getInstanceByDom(dom);
      if (!myChart && !myChartResponsive) {
        myChart = echarts.init(dom, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });

        myChartResponsive = echarts.init(domResponsive, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });

        var data = [];
        data.push(['score', 'amount', 'product']);
        this.subTopicsCharts.forEach(function (item) {
          data.push([
            parseFloat(item['score']).toFixed(2) ?? 0,
            parseFloat(item['score']).toFixed(2) ?? 0,
            item['resultable']['name'],
          ]
          )
        })

        var option = {
          tooltip: {
            trigger: 'item'
          },
          dataset: {
            source:
              data
          },

          grid: { containLabel: true },
          xAxis: {
            name: 'Calificación',
            max: 10,
          },
          yAxis: { type: 'category' },
          series: [
            {
              type: 'bar',
              itemStyle: {
                color: function (params) {
                  if (params.value[0] < 5) {
                    return '#FF6E76';
                  } else if (params.value[0] >= 5 && params.value[0] < 7.5) {
                    return '#FDDD60';
                  } else {
                    return '#65B581';
                  }
                }
              },
              encode: {
                x: 'amount',
                y: 'product'
              },
              label: {
                show: true,
                position: 'inside'
              },
            }
          ]
        };

        var optionResponsive = {
          tooltip: {
            trigger: 'item'
          },
          dataset: {
            source: data
          },
          xAxis: {
            type: 'category',
            axisLabel: {
              interval: 0,

              formatter: function (value) {
                return value.split(" ").join("\n");
              }
            }
          },
          yAxis: { max: 10, name: 'Calificación', },

          series: [
            {
              type: 'bar',
              itemStyle: {
                color: function (params) {
                  if (params.value[0] < 5) {
                    return '#FF6E76';
                  } else if (params.value[0] >= 5 && params.value[0] < 7.5) {
                    return '#FDDD60';
                  } else {
                    return '#65B581';
                  }
                }
              },
              encode: {
                y: 'amount',
                x: 'product'
              },
              label: {
                show: true,
                position: 'inside'
              },
            }]
        };

        if (option && typeof option === 'object') {
          myChart.setOption(option);
        }

        if (optionResponsive && typeof optionResponsive === 'object') {
          myChartResponsive.setOption(optionResponsive);
        }
      }

    }

  }

  updateCantons(value: any) {
    this.cantonsShow = this.cantons.filter(element => element['parent_id'] == value)
  }

  updateParrishes(value: any) {
    this.parrishesShow = this.parrishes.filter(element => element['parent_id'] == value)
  }

  chargeData() {
    try {
      if (this.localStore.getData('email')) {
        var email = this.localStore.getData('email') ? this.localStore.getData('email') : this.establishmentInitial.email;
        this.establishmentService.showActiveEstablishment(email).subscribe((data: Establishment) => {
          this.establishment = data;
          this.localStore.saveData('idEstablishment', this.establishment['id'].toString());
          this.localStore.saveData('intent_id', this.establishment['intent_id']);
          var form = this.establishment.results.find(element => element['resultable_type'] == "App\\Models\\Forms\\Form")
          this.form = form.resultable;
          this.formDisplayChart = form;
          var components = this.establishment.results.filter(element => element['resultable_type'] == "App\\Models\\Forms\\Component")
          this.components = components;
          this.componentsCharts = components;
          var subTopics = this.establishment.results.filter(element => element['resultable_type'] == "App\\Models\\Forms\\SubTopic")
          this.subTopics = subTopics;
          if (this.index == 0) {
            this.subTopicsSteps = subTopics.filter(element => element.resultable['component_id'] == this.components[0]['resultable_id']);
            this.chargeQuestionsOfSubtopic(this.subTopicsSteps[0]['resultable_id'])
          }
          this.subTopicsCharts = this.subTopics.filter(element => element['resultable']['component_id'] == this.components[0]['resultable']['id']);
          this.updateProgress();
          this.fillQuestionsChart();
        }, err => {
          // this.message.create('error', `Error: al cargar la data inicial`);
        });
      }
    } catch (e) {

      this.message.create('error', `Error: al cargar la data inicial`);
    }
  }

  chargeQuestionsOfSubtopic(subTopicId) {
    let idEstablishment = this.localStore.getData('idEstablishment');
    let intentId = this.localStore.getData('intent_id');
    this.establishmentService.showQuestionsOfSubtopic(subTopicId, idEstablishment, intentId).subscribe((data: Establishment) => {
      this.questionsSteps = data['questions'];
    }, err => {
      this.message.create('error', `Error: al obtener las preguntas para el ambito`);
    });
    this.localStore.saveData('sub_topic_id', subTopicId.toString())
    this.subTopic = this.subTopics.find(element => element['resultable']['id'] == subTopicId)
  }

  isLoadingQuestions = false;

  fillQuestionsChart() {
    this.isLoadingQuestions = true;
    this.establishmentService.showQuestionsResults(this.localStore.getData('sub_topic_id'), this.establishment['id'], this.establishment['intent_id']).subscribe((data: Establishment) => {
      this.isLoadingQuestions = false;
      this.questionsChart = data['questions'].filter(function (element) {
        if (element['resultable']['type'] == 'relacionada') {
          if (element['score'] / 10 < 5) {
            return element;
          }
        } else if (element['resultable']['type'] == 'si_no') {
          if (element['score'] * 10 < 5) {
            return element;
          }
        } else if (element['resultable']['type'] == 'rango_1_5') {
          if (element['score'] * 5 < 5) {
            return element;
          }
        }
      })
      this.questionsChartDisplay = this.questionsChart;
      console.log(this.questionsChartDisplay.length)
    }, err => {
      this.message.create('error', `Error: al cargar las preguntas de los resultados`);
    });

  }

  handleTabChangeTabCharts(event) {
    if (this.components[event]) {
      this.subTopicsCharts = this.subTopics.filter(element => element['resultable']['component_id'] == this.components[event]['resultable']['id']);
    }
    this.index = 0;
    this.showSubTopicsChart();
  }

  handleSelectionChange(value: any) {

    this.isLoadingQuestions=true;
    if (value) {
      this.questionsChartDisplay = this.questionsChart.filter(function (element) {
        if (element['resultable']['type'] == 'relacionada') {
          if (element['score'] / 10 < 5) {
            return element['resultable']['sub_topics'][0]['id'] == value;
          }
        } else if (element['resultable']['type'] == 'si_no') {
          if (element['score'] * 10 < 5) {
            return element['resultable']['sub_topics'][0]['id'] == value;
          }
        } else if (element['resultable']['type'] == 'rango_1_5') {
          if (element['score'] * 5 < 5) {
            return element['resultable']['sub_topics'][0]['id'] == value;
          }
        }

      })
    } else {
      this.questionsChartDisplay = this.questionsChart;
    }
    this.isLoadingQuestions=false;


  }

  reloadPage() {
    window.location.reload();
  }

  updateProgress() {

    try {
      let idEstablishment = this.localStore.getData('idEstablishment');
      let intentId = this.localStore.getData('intent_id');
      this.establishmentService.showPercentage(idEstablishment, intentId).subscribe((data: Establishment) => {
        this.percentage = data['percentage'];
      }, err => {
        this.message.create('error', `Error: al cargar el porcentaje de avance`);
      });
    } catch (e) {
      this.message.create('error', `Error: al cargar el porcentaje de avance`);
    }
  }

  finishForm() {
    try {
      this.isLoadingFinish = true;
      var message = "Si da click en Aceptar su formulario será guardado y no podrá modificar sus respuestas."
      this.modalService.confirm({
        nzTitle: 'Finalizar el formulario',
        nzContent: message,
        nzWidth: '550px',
        nzOnOk: () => {
          try {
            this.establishmentService.updateIntent(this.establishment.id).subscribe(res => {
              this.message.create('success', "Guardado Exitosamente");
              this.chargeData();
              this.isLoadingFinish = false;

            }, err => {
              this.showErrors(err)
            });
          } catch (e) {
            this.message.create('error', `Error al finalizar el formulario`);
          }

        }
      });
    } catch (e) {
      this.message.create('error', `Error al finalizar el formulario`);
    }
  }

  findPrevious(): void {
    this.isLoadingPrevious = true;
    window.scrollTo(-10, -10);

    if (this.index == 0 && this.selectedIndexComponent > 0) {
      this.index = 0;
      this.selectedIndexComponent = this.selectedIndexComponent - 1;
      this.handleSelectionChange(this.selectedIndexComponent)
    } else if (this.index != 0) {
      this.index = this.index - 1;
      var subTopicId = this.subTopicsSteps[this.index]
      this.chargeQuestionsOfSubtopic(subTopicId['resultable_id']);
    }
    this.isLoadingPrevious = false;

  }

  validateNext() {


    this.isLoadingNext = true;
    let idEstablishment = this.localStore.getData('idEstablishment');
    let intentId = this.localStore.getData('intent_id');
    this.establishmentService.showQuestionsOfSubtopicValidate(this.localStore.getData('sub_topic_id'), idEstablishment, intentId)
      .subscribe((data: Establishment) => {
        const questionWithOutScore = data['questions'].find(
          element => element['score'] == null
        )

        if (!questionWithOutScore) {
          window.scrollTo(-10, -10);

          if (this.index == this.subTopicsSteps.length - 1 && this.selectedIndexComponent < this.components.length - 1) {
            this.index = 0;
            this.selectedIndexComponent = this.selectedIndexComponent + 1;
            this.handleSelectionChange(this.selectedIndexComponent)
          } else if (this.index != this.subTopicsSteps.length - 1) {
            this.index = this.index + 1
            var subTopicId = this.subTopicsSteps[this.index]
            this.chargeQuestionsOfSubtopic(subTopicId['resultable_id']);
          }
        } else {
          try {
            var message = "<p>Le restan preguntas por responder</p>"
            this.modalService.confirm({
              nzTitle: 'No puede continuar',
              nzContent: message,
              nzWidth: '450px',
            });
          } catch (e) {
            this.message.create('error', `Error ${e}`);
          }
        }
        this.isLoadingNext = false;
      }, err => {
        this.message.create('error', `Error: al cargar las preguntas de validación`);
      });
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = url;
    });
  }
  img_footer = this.getBase64ImageFromURL('../../assets/images/logo/logo_gob1.png');


  async downloadPdf(action = 'download') {
    this.isLoadingDownload = true;

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
                    text: this.formDisplay.name,
                    alignment: 'center',
                  },
                ],
                [
                  { text: this.formDisplay.description, bold: true },
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
                      text: this.establishment.name
                    },
                  ],
                  [
                    { text: 'Correo', bold: true },
                    {
                      text: this.establishment.email
                    },
                  ],
                  [
                    { text: 'Nombre establecimiento', bold: true },
                    {
                      text: this.establishment.company
                    },
                  ],
                  [
                    { text: 'RUC', bold: true },
                    {
                      text: this.establishment.ruc
                    },
                  ],
                  [
                    { text: 'Tipo', bold: true },
                    {
                      text: this.establishment.type_of_taxpayer
                    },
                  ],
                  [
                    { text: 'Dirección', bold: true },
                    {
                      text: this.establishment.direction
                    },
                  ],

                ],
              },
            },

            {
              table: {
                headerRows: 1,
                widths: ['auto'],
                body: [
                  [{ text: 'Visita tus resultados en linea', alignment: 'right' }],
                  [{ qr: `https://formulario-evaluacion-minturismo.laverix.com.ec/mintur/formulario`, fit: '100' }],
                ],
              },
              alignment: 'right',
              layout: 'noBorders',
            },
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
                  text: this.formDisplay['name'],
                  alignment: 'center',
                },
                {
                  text: (this.formDisplayChart['score'] * 1).toFixed(2),
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
              ...this.componentsCharts.map((p) => [
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
              ...this.subTopics.map((p) => [
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
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [
              [
                {
                  text: 'A CONTINUACIÓN SE MUESTRA LA IMPORTANCIA Y MEDIOS DE VERIFICACIÓN DE LAS PREGUNTAS CON BAJA CALIFICACIÓN',
                  alignment: 'center',
                  fillColor: '#26506d',
                  color: 'white',
                  colSpan: 4,
                }, {}, {}, {}
              ],
              [
                {
                  text: 'Pregunta',
                  alignment: 'center',
                  fillColor: '#26506d',
                  color: 'white',
                },
                {
                  text: 'Importancia',
                  alignment: 'center',
                  fillColor: '#26506d',
                  color: 'white',
                },
                {
                  text: 'Medios de verificación',
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
              ...this.questionsChartDisplay.map((p) => [
                p['resultable']['name'],
                p['resultable']['importance'],
                p['resultable']['verification_means'],
                p['resultable']['type'] == 'relacionada' ? (p['score'] / 10).toFixed(2) : p['resultable']['type'] == 'si_no' ? (p['score'] * 10).toFixed(2) : (p['score'] * 5).toFixed(2)
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
      pdfMake.createPdf(docDefinition).download('Evaluacion.pdf');
      this.isLoadingDownload = false;

    }
  }
}
