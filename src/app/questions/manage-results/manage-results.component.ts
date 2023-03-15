import { Component, OnInit, AfterViewChecked, HostListener } from '@angular/core';
import { ThemeConstantService } from 'src/app/shared/services/theme-constant.service';
import * as echarts from 'echarts';
import { GeographichClassifierService } from 'src/app/services/geographich-classifier.service';
import { GeographichClassifier } from 'src/app/services/geographich-classifier';
import { EstablishmentService } from 'src/app/test-form/establishment.service';
import { Establishment } from 'src/app/test-form/establishment';
import { EstablishmentTypeService } from 'src/app/test-form/establishment-type.service';
import { EstablishmentType } from 'src/app/test-form/establishment-type';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TokenService } from 'src/app/shared/token.service';
import { AuthStateService } from 'src/app/shared/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-results',
  templateUrl: './manage-results.component.html',
  styleUrls: ['./manage-results.component.css']
})
export class ManageResultsComponent implements OnInit, AfterViewChecked {
  @HostListener('window:resize', ['$event'])

  geographics: GeographichClassifier[];
  establishments: number;
  establishmentTypes: EstablishmentType[] = [];
  numberEstablishmentDay: number = 0;
  percentageToday: any;
  numberNoComplete: number = 0;
  numberOneComplete: number = 0;
  numberAllComplete: number = 0;
  numberStartCompleteForm: number = 0;
  numberOnlyRegister: number = 0;
  percentageComplete: number = 0;
  isLoading = false;
  establishmentsGrouped: any[];
  constructor(private colorConfig: ThemeConstantService,
    private geographicService: GeographichClassifierService,
    private establishmentService: EstablishmentService,
    private establishmentTypesService: EstablishmentTypeService,
    private message: NzMessageService, private auth: AuthStateService,
    public token: TokenService, private router: Router) {
      this.isLoading = true;

  }

  themeColors = this.colorConfig.get().colors;
  blue = this.themeColors.blue;
  blueLight = this.themeColors.blueLight;
  cyan = this.themeColors.cyan;
  cyanLight = this.themeColors.cyanLight;
  gold = this.themeColors.gold;
  purple = this.themeColors.purple;
  purpleLight = this.themeColors.purpleLight;
  red = this.themeColors.red;
  chartGeneral: any
  chartProvinces: any

  ngOnInit(): void {
    this.isLoading = true;
    try {

      this.geographicService.getAllProvinces().subscribe((data: GeographichClassifier[]) => {
        this.geographics = data;
      })

      this.establishmentService.getAllResults().subscribe((data: number) => {
        this.establishments = data;
        console.log
      })

      this.establishmentService.getAllLastDay().subscribe((data: number) => {
        this.numberEstablishmentDay = data;
      })

      this.establishmentService.getEstablishmentsNoCompletedForm().subscribe((data: number[]) => {
        this.numberNoComplete = data['zero'];
        this.numberOneComplete = data['one'];
        this.numberAllComplete = data['all'];
        this.numberStartCompleteForm = data['establishments_start_form'];
        this.numberOnlyRegister = data['establishments_only_register'];
        this.percentageComplete = data['promPercentage'];
        this.isLoading=false;

      })

      this.establishmentTypesService.getAll().subscribe((data: EstablishmentType[]) => {
        this.establishmentTypes = data;
      }, err => {
        this.message.create('error', `Error: ${err.error.message}`);
        if (err.error.message == 'Unauthenticated.') {
          this.signOut();
        }
      })
    } catch (e) {
      this.message.create('error', `Error ${e}`);
    }
  }

  signOut() {
    this.auth.setAuthState(false);
    this.token.removeToken();
    this.router.navigate(['login']);
  }

  ngAfterViewChecked() {
    this.percentageToday = (this.numberEstablishmentDay / this.establishments * 100).toFixed(0);
    if (!this.chartGeneral) {
      this.showGeneralResults();
    }
    if (!this.chartProvinces) {
      this.showGeneralLocation();
    }

  }

  showGeneralResults() {
    var dom = document.getElementById('generalResults');
    if (dom) {
      this.chartGeneral = echarts.getInstanceByDom(dom);
      if (!this.chartGeneral && this.establishmentTypes.length > 0) {
        this.chartGeneral = echarts.init(dom, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });


        let dataAxis = [];
        let data = [];

        this.establishmentTypes.forEach(function (item) {
          dataAxis.push(item.name)
          data.push(item['establishments'].length)
        })

        var option = {

          xAxis: {
            data: dataAxis,

            axisLabel: {
              inside: true,
              color: '#fff',
              rotate: 90
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            z: 10,
          },
          yAxis: {
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              color: '#999'
            }
          },
          dataZoom: [
            {
              type: 'inside'
            }
          ],
          series: [
            {
              type: 'bar',
              showBackground: true,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#83bff6' },
                  { offset: 0.5, color: '#188df0' },
                  { offset: 1, color: '#188df0' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#2378f7' },
                    { offset: 0.7, color: '#2378f7' },
                    { offset: 1, color: '#83bff6' }
                  ])
                }
              },
              data: data
            }
          ]
        };

        if (option && typeof option === 'object') {
          this.chartGeneral.setOption(option);
        }
      }
    }

  }

  showGeneralLocation() {
    var dom = document.getElementById('generalResultsLocation');
    if (dom) {
      this.chartProvinces = echarts.getInstanceByDom(dom);
      if (!this.chartProvinces) {
        this.chartProvinces = echarts.init(dom, null, {
          renderer: 'canvas',
          useDirtyRect: false
        });

        const data = this.genData(this.geographics.length);

        var option = {
          title: {
            text: 'Resultados por Provinicia',
            left: 'center'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
          },
          legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
            data: data.legendData
          },
          series: [
            {
              name: 'Nombre 1',
              type: 'pie',
              radius: '55%',
              center: ['40%', '50%'],
              data: data.seriesData,
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };

        if (option && typeof option === 'object') {
          this.chartProvinces.setOption(option);
        }
      }
    }
  }

  genData(count: number) {
    // prettier-ignore
    const nameList = [];
    this.geographics.forEach(function (province) {
      nameList.push(province)
    })
    const legendData = [];
    const seriesData = [];
    nameList.forEach(function (province) {
      legendData.push(province.description);
      seriesData.push({
        name: province.description,
        value: province.establishments.length
      });
    })
    return {
      legendData: legendData,
      seriesData: seriesData
    };
  }

  onResize(event) {
    this.chartGeneral.resize();
    this.chartProvinces.resize();
  }
}
