import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartComponent } from 'highcharts-angular';


@NgModule({
  declarations: [
    HighchartsChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    HighchartsChartComponent
  ]
})
export class HighchartsWrapperModule { }
