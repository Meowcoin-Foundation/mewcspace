import { ChangeDetectionStrategy, Component, Inject, Input, LOCALE_ID, OnInit, HostBinding } from '@angular/core';
import { EChartsOption, graphic } from 'echarts';
import { combineLatest, merge, Observable, of } from 'rxjs';
import { map, mergeMap, share, startWith, switchMap, tap } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import { formatNumber } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { selectPowerOfTen } from '../../bitcoin.utils';
import { StorageService } from '../../services/storage.service';
import { MiningService } from '../../services/mining.service';
import { download } from '../../shared/graphs.utils';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-hashrate-chart',
  templateUrl: './hashrate-chart.component.html',
  styleUrls: ['./hashrate-chart.component.scss'],
  styles: [`
    .loadingGraphs {
      position: absolute;
      top: 50%;
      left: calc(50% - 15px);
      z-index: 100;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HashrateChartComponent implements OnInit {
  @Input() tableOnly = false;
  @Input() widget = false;
  @Input() right: number | string = 45;
  @Input() left: number | string = 75;
  @Input() algorithm: 'meowpow' | 'scrypt' = 'meowpow';

  miningWindowPreference: string;
  radioGroupForm: UntypedFormGroup;

  chartOptions: EChartsOption = {};
  chartInitOptions = {
    renderer: 'svg',
  };

  @HostBinding('attr.dir') dir = 'ltr';

  hashrateObservable$: Observable<any>;
  dualPowStats$: Observable<any>;
  selectedAlgorithm: 'meowpow' | 'scrypt' = 'meowpow';
  isLoading = true;
  formatNumber = formatNumber;
  timespan = '';
  chartInstance: any = undefined;
  network = '';

  selectAlgorithm(algorithm: 'meowpow' | 'scrypt'): void {
    this.algorithm = algorithm;
    this.selectedAlgorithm = algorithm;
    // Trigger data refresh
    this.ngOnInit();
  }

  selectAlgorithmFromStats(algorithm: 'meowpow' | 'scrypt'): void {
    this.selectedAlgorithm = algorithm;
    this.algorithm = algorithm;
    // Trigger data refresh
    this.ngOnInit();
  }

  getAlgorithmColors() {
    const isScrypt = this.algorithm === 'scrypt';
  
    // Vibrant cyan-green gradient for hashrate (stands out beautifully on dark)
    const hashrateGradient = new graphic.LinearGradient(0, 0, 0, 0.65, [
      { offset: 0, color: '#00E5FF' },  // bright cyan
      { offset: 0.25, color: '#00BCD4' }, // teal
      { offset: 0.5, color: '#00C853' },  // vivid green
      { offset: 0.75, color: '#AEEA00' }, // lime glow
      { offset: 1, color: '#F4FF81' }     // soft yellow highlight
    ]);
  
    // Softer, semi-transparent version for moving average
    const hashrateMAGradient = new graphic.LinearGradient(0, 0, 0, 0.65, [
      { offset: 0, color: '#00E5FF55' },
      { offset: 0.25, color: '#00BCD455' },
      { offset: 0.5, color: '#00C85355' },
      { offset: 0.75, color: '#AEEA0055' },
      { offset: 1, color: '#F4FF8155' }
    ]);
  
    return {
      hashrate: hashrateGradient, // main line - bright and clean
      difficulty: '#FF5252',      // vivid red but not painful
      hashrateMa: hashrateMAGradient // smooth, translucent overlay
    };
  }
  

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private seoService: SeoService,
    private apiService: ApiService,
    private formBuilder: UntypedFormBuilder,
    private storageService: StorageService,
    private miningService: MiningService,
    private route: ActivatedRoute,
    private stateService: StateService
  ) {
  }

  ngOnInit(): void {
    this.stateService.networkChanged$.subscribe((network) => this.network = network);

    let firstRun = true;

    if (this.widget) {
      this.miningWindowPreference = '1y';
      // Use hybrid approach: API for hashrate, WebSocket for difficulty
      this.dualPowStats$ = combineLatest([
        this.apiService.getDualPowStats$(),
        this.stateService.dualDifficultyAdjustment$
      ]).pipe(
        map(([apiStats, wsStats]) => this.combineStatsData(apiStats, wsStats))
      );
    } else {
      this.seoService.setTitle($localize`:@@3510fc6daa1d975f331e3a717bdf1a34efa06dff:Hashrate & Difficulty`);
      this.miningWindowPreference = this.miningService.getDefaultTimespan('3m');
    }
    this.radioGroupForm = this.formBuilder.group({ dateSpan: this.miningWindowPreference });
    this.radioGroupForm.controls.dateSpan.setValue(this.miningWindowPreference);

    this.route
      .fragment
      .subscribe((fragment) => {
        if (['1m', '3m', '6m', '1y', '2y', '3y', 'all'].indexOf(fragment) > -1) {
          this.radioGroupForm.controls.dateSpan.setValue(fragment, { emitEvent: false });
        }
      });

    this.hashrateObservable$ = merge(
      this.radioGroupForm.get('dateSpan').valueChanges
        .pipe(
          startWith(this.radioGroupForm.controls.dateSpan.value),
          switchMap((timespan) => {
            if (!this.widget && !firstRun) {
              this.storageService.setValue('miningWindowPreference', timespan);
            }
            this.timespan = timespan;
            firstRun = false;
            this.miningWindowPreference = timespan;
            this.isLoading = true;
            return this.apiService.getHistoricalHashrate$(this.timespan, this.algorithm);
          })
        ),
        this.stateService.chainTip$
          .pipe(
            switchMap(() => {
              return this.apiService.getHistoricalHashrate$(this.timespan, this.algorithm);
            })
          )
      ).pipe(
        tap((response: any) => {
          const data = response.body;

          // We generate duplicated data point so the tooltip works nicely
          const diffFixed = [];
          let diffIndex = 1;
          let hashIndex = 0;
          while (hashIndex < data.hashrates.length) {
            if (diffIndex >= data.difficulty.length) {
              while (hashIndex < data.hashrates.length) {
                diffFixed.push({
                  timestamp: data.hashrates[hashIndex].timestamp,
                  difficulty: data.difficulty.length > 0 ?  data.difficulty[data.difficulty.length - 1].difficulty : null
                });
                ++hashIndex;
              }
              break;
            }

            while (hashIndex < data.hashrates.length && diffIndex < data.difficulty.length &&
              data.hashrates[hashIndex].timestamp <= data.difficulty[diffIndex].time
            ) {
              diffFixed.push({
                timestamp: data.hashrates[hashIndex].timestamp,
                difficulty: data.difficulty[diffIndex - 1].difficulty
              });
              ++hashIndex;
            }
            ++diffIndex;
          }

          let maResolution = 15;
          const hashrateMa = [];
          for (let i = maResolution - 1; i < data.hashrates.length; ++i) {
            let avg = 0;
            for (let y = maResolution - 1; y >= 0; --y) {
              avg += data.hashrates[i - y].avgHashrate;
            }
            avg /= maResolution;
            hashrateMa.push([data.hashrates[i].timestamp * 1000, avg]);
          }

          this.prepareChartOptions({
            hashrates: data.hashrates.map(val => [val.timestamp * 1000, val.avgHashrate]),
            difficulty: diffFixed.map(val => [val.timestamp * 1000, val.difficulty]),
            hashrateMa: hashrateMa,
          });
          this.isLoading = false;
        }),
        map((response) => {
          const data = response.body;
          return {
            blockCount: parseInt(response.headers.get('x-total-count'), 10),
            currentDifficulty: data.currentDifficulty,
            currentHashrate: data.currentHashrate,
          };
        }),
        share()
      );
  }

  prepareChartOptions(data) {
    let title: object;
    if (data.hashrates.length === 0) {
      title = {
        textStyle: {
          color: 'grey',
          fontSize: 15
        },
        text: $localize`:@@23555386d8af1ff73f297e89dd4af3f4689fb9dd:Indexing blocks`,
        left: 'center',
        top: 'center'
      };
    }

    const colors = this.getAlgorithmColors();
    
    this.chartOptions = {
      title: title,
      animation: false,
      color: [
        colors.hashrate,
        colors.difficulty,
        colors.hashrateMa,
      ],
      grid: {
        top: this.widget ? 20 : 40,
        bottom: this.widget ? 30 : 70,
        right: this.right,
        left: this.left,
      },
      tooltip: {
        show: !this.isMobile() || !this.widget,
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        },
        backgroundColor: 'rgba(17, 19, 31, 1)',
        borderRadius: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        textStyle: {
          color: '#b1b1b1',
          align: 'left',
        },
        borderColor: '#000',
        formatter: (ticks) => {
          let hashrateString = '';
          let difficultyString = '';
          let hashrateStringMA = '';
          let hashratePowerOfTen: any = selectPowerOfTen(1);

          for (const tick of ticks) {
            if (tick.seriesIndex === 0) { // Hashrate
              let hashrate = tick.data[1];
              if (this.isMobile()) {
                hashratePowerOfTen = selectPowerOfTen(tick.data[1]);
                hashrate = Math.round(tick.data[1] / hashratePowerOfTen.divider);
              }
              hashrateString = `${tick.marker} ${tick.seriesName}: ${formatNumber(hashrate, this.locale, '1.0-0')} ${hashratePowerOfTen.unit}H/s<br>`;
            } else if (tick.seriesIndex === 1) { // Difficulty
              let difficultyPowerOfTen = hashratePowerOfTen;
              let difficulty = tick.data[1];
              if (difficulty === null) {
                difficultyString = `${tick.marker} ${tick.seriesName}: No data<br>`;  
              } else {
                if (this.isMobile()) {
                  difficultyPowerOfTen = selectPowerOfTen(tick.data[1]);
                  difficulty = Math.round(tick.data[1] / difficultyPowerOfTen.divider);
                }
                difficultyString = `${tick.marker} ${tick.seriesName}: ${formatNumber(difficulty, this.locale, '1.2-2')} ${difficultyPowerOfTen.unit}<br>`;
              }
            } else if (tick.seriesIndex === 2) { // Hashrate MA
              let hashrate = tick.data[1];
              if (this.isMobile()) {
                hashratePowerOfTen = selectPowerOfTen(tick.data[1]);
                hashrate = Math.round(tick.data[1] / hashratePowerOfTen.divider);
              }
              hashrateStringMA = `${tick.marker} ${tick.seriesName}: ${formatNumber(hashrate, this.locale, '1.0-0')} ${hashratePowerOfTen.unit}H/s`;
            }
          }

          const date = new Date(ticks[0].data[0]).toLocaleDateString(this.locale, { year: 'numeric', month: 'short', day: 'numeric' });

          return `
            <b style="color: white; margin-left: 2px">${date}</b><br>
            <span>${difficultyString}</span>
            <span>${hashrateString}</span>
            <span>${hashrateStringMA}</span>
          `;
        }
      },
      xAxis: data.hashrates.length === 0 ? undefined : {
        type: 'time',
        splitNumber: (this.isMobile() || this.widget) ? 5 : 10,
        axisLabel: {
          hideOverlap: true,
        }
      },
      legend: this.widget ? undefined : {
        data: [
          {
            name: `${this.algorithm === 'scrypt' ? 'Scrypt' : 'MeowPow'} ${$localize`:@@79a9dc5b1caca3cbeb1733a19515edacc5fc7920:Hashrate`}`,
            inactiveColor: 'rgb(110, 112, 121)',
            textStyle: {
              color: 'white',
            },
            icon: 'roundRect',
            itemStyle: {
              color: this.algorithm === 'scrypt' ? '#3B82F6' : '#FFB300',
            },
          },
          {
            name: `${this.algorithm === 'scrypt' ? 'Scrypt' : 'MeowPow'} ${$localize`:@@25148835d92465353fc5fe8897c27d5369978e5a:Difficulty`}`,
            inactiveColor: 'rgb(110, 112, 121)',
            textStyle: {
              color: 'white',
            },
            icon: 'roundRect',
            itemStyle: {
              color: this.algorithm === 'scrypt' ? '#1E40AF' : '#D81B60',
            },
          },
          {
            name: `${this.algorithm === 'scrypt' ? 'Scrypt' : 'MeowPow'} ${$localize`Hashrate (MA)`}`,
            inactiveColor: 'rgb(110, 112, 121)',
            textStyle: {
              color: 'white',
            },
            icon: 'roundRect',
            itemStyle: {
              color: this.algorithm === 'scrypt' ? '#3B82F6' : '#FFB300',
            },
          },
        ],
        selected: JSON.parse(this.storageService.getValue('hashrate_difficulty_legend')) ?? {
          '$localize`:@@79a9dc5b1caca3cbeb1733a19515edacc5fc7920:Hashrate`': true,
          '$localize`::Difficulty`': this.network === '',
          '$localize`Hashrate (MA)`': true,
        },
      },
      yAxis: data.hashrates.length === 0 ? undefined : [
        {
          min: (value) => {
            const selectedPowerOfTen: any = selectPowerOfTen(value.min);
            const newMin = Math.floor(value.min / selectedPowerOfTen.divider / 10);
            return newMin * selectedPowerOfTen.divider * 10;
          },
          type: 'value',
          axisLabel: {
            color: 'rgb(110, 112, 121)',
            formatter: (val) => {
              const selectedPowerOfTen: any = selectPowerOfTen(val);
              const newVal = Math.round(val / selectedPowerOfTen.divider);
              return `${newVal} ${selectedPowerOfTen.unit}H/s`;
            }
          },
          splitLine: {
            lineStyle: {
              type: 'dotted',
              color: '#ffffff66',
              opacity: 0.25,
            }
          },
        },
        {
          min: (value) => {
            return value.min * 0.9;
          },
          type: 'value',
          position: 'right',
          axisLabel: {
            color: 'rgb(110, 112, 121)',
            formatter: (val) => {
              if (this.stateService.network === 'signet') {
                return val;
              }
              const selectedPowerOfTen: any = selectPowerOfTen(val);
              const newVal = Math.round(val / selectedPowerOfTen.divider);
              return `${newVal} ${selectedPowerOfTen.unit}`;
            }
          },
          splitLine: {
            show: false,
          }
        }
      ],
      series: data.hashrates.length === 0 ? [] : [
        {
          zlevel: 0,
          yAxisIndex: 0,
          name: $localize`:@@79a9dc5b1caca3cbeb1733a19515edacc5fc7920:Hashrate`,
          showSymbol: false,
          symbol: 'none',
          data: data.hashrates,
          type: 'line',
          lineStyle: {
            width: 1,
          },
        },
        {
          zlevel: 1,
          yAxisIndex: 1,
          name: $localize`:@@25148835d92465353fc5fe8897c27d5369978e5a:Difficulty`,
          showSymbol: false,
          symbol: 'none',
          data: data.difficulty,
          type: 'line',
          lineStyle: {
            width: 3,
          }
        },
        {
          zlevel: 2,
          name: $localize`Hashrate (MA)`,
          showSymbol: false,
          symbol: 'none',
          data: data.hashrateMa,
          type: 'line',
          smooth: true,
          lineStyle: {
            width: 3,
          }
        }
      ],
      dataZoom: this.widget ? null : [{
        type: 'inside',
        realtime: true,
        zoomLock: true,
        maxSpan: 100,
        minSpan: 5,
        moveOnMouseMove: false,
      }, {
        showDetail: false,
        show: true,
        type: 'slider',
        brushSelect: false,
        realtime: true,
        left: 20,
        right: 15,
        selectedDataBackground: {
          lineStyle: {
            color: '#fff',
            opacity: 0.45,
          },
          areaStyle: {
            opacity: 0,
          }
        },
      }],
    };
  }

  onChartInit(ec) {
    this.chartInstance = ec;

    this.chartInstance.on('legendselectchanged', (e) => {
      this.storageService.setValue('hashrate_difficulty_legend', JSON.stringify(e.selected));
    });
  }

  isMobile() {
    return (window.innerWidth <= 767.98);
  }

  onSaveChart() {
    // @ts-ignore
    const prevBottom = this.chartOptions.grid.bottom;
    const now = new Date();
    // @ts-ignore
    this.chartOptions.grid.bottom = 30;
    this.chartOptions.backgroundColor = '#11131f';
    this.chartInstance.setOption(this.chartOptions);
    download(this.chartInstance.getDataURL({
      pixelRatio: 2,
      excludeComponents: ['dataZoom'],
    }), `hashrate-difficulty-${this.timespan}-${Math.round(now.getTime() / 1000)}.svg`);
    // @ts-ignore
    this.chartOptions.grid.bottom = prevBottom;
    this.chartOptions.backgroundColor = 'none';
    this.chartInstance.setOption(this.chartOptions);
  }

  private combineStatsData(apiStats: any, wsStats: any): any {
    // Use API data for hashrate, WebSocket data for difficulty
    return {
      meowpow: {
        currentDifficulty: wsStats?.meowpow?.currentDifficulty || 0,
        difficultyChange: wsStats?.meowpow?.difficultyChange || 0,
        slope: wsStats?.meowpow?.slope || 0,
        timingRatio: wsStats?.meowpow?.timingRatio || 1.0,
        avgBlockTime: wsStats?.meowpow?.avgBlockTime || 120,
        lastUpdate: wsStats?.meowpow?.lastUpdate || Math.floor(Date.now() / 1000),
        auxpowActive: true,
        hashrate: apiStats?.meowpow?.hashrate || 0, // From API
        difficulty: wsStats?.meowpow?.currentDifficulty || 0 // From WebSocket
      },
      scrypt: {
        currentDifficulty: wsStats?.scrypt?.currentDifficulty || 0,
        difficultyChange: wsStats?.scrypt?.difficultyChange || 0,
        slope: wsStats?.scrypt?.slope || 0,
        timingRatio: wsStats?.scrypt?.timingRatio || 1.0,
        avgBlockTime: wsStats?.scrypt?.avgBlockTime || 120,
        lastUpdate: wsStats?.scrypt?.lastUpdate || Math.floor(Date.now() / 1000),
        auxpowActive: wsStats?.scrypt?.auxpowActive || false,
        hashrate: apiStats?.scrypt?.hashrate || 0, // From API
        difficulty: wsStats?.scrypt?.currentDifficulty || 0 // From WebSocket
      }
    };
  }

  private addDifficultyAdjustmentData(stats: any): any {
    if (!stats) {
      return {
        meowpow: this.getDefaultAlgorithmData('MeowPow', true),
        scrypt: this.getDefaultAlgorithmData('Scrypt', false)
      };
    }

    return {
      meowpow: {
        currentDifficulty: stats.meowpow?.currentDifficulty || 0,
        difficultyChange: stats.meowpow?.difficultyChange || 0,
        slope: stats.meowpow?.slope || 0,
        timingRatio: stats.meowpow?.timingRatio || 1.0,
        avgBlockTime: stats.meowpow?.avgBlockTime || 120,
        lastUpdate: stats.meowpow?.lastUpdate || Math.floor(Date.now() / 1000),
        auxpowActive: true,
        hashrate: stats.meowpow?.hashrate || 0,
        difficulty: stats.meowpow?.currentDifficulty || 0
      },
      scrypt: {
        currentDifficulty: stats.scrypt?.currentDifficulty || 0,
        difficultyChange: stats.scrypt?.difficultyChange || 0,
        slope: stats.scrypt?.slope || 0,
        timingRatio: stats.scrypt?.timingRatio || 1.0,
        avgBlockTime: stats.scrypt?.avgBlockTime || 120,
        lastUpdate: stats.scrypt?.lastUpdate || Math.floor(Date.now() / 1000),
        auxpowActive: stats.scrypt?.auxpowActive || false,
        hashrate: stats.scrypt?.hashrate || 0,
        difficulty: stats.scrypt?.currentDifficulty || 0
      }
    };
  }

  private getDefaultAlgorithmData(algorithm: string, auxpowActive: boolean): any {
    return {
      currentDifficulty: 0,
      difficultyChange: 0,
      slope: 0,
      timingRatio: 1.0,
      avgBlockTime: 120,
      lastUpdate: Math.floor(Date.now() / 1000),
      auxpowActive,
      hashrate: 0,
      difficulty: 0
    };
  }
}
