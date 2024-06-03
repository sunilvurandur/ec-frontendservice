import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import {MatCardModule} from '@angular/material/card';

//services
interface JsonObject {
  [key: string]: any; // This allows you to use any string as a key with any type of value.
}

interface Constituency {
  name: string;
  range: string;
}
import { MainServiceService } from '../main-service.service';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts, { SeriesPieOptions } from 'highcharts';
import { Options, SeriesBarOptions } from 'highcharts';

interface ChartOptions extends Options {
  xAxis: {
    categories: string[];
  };
  series: SeriesBarOptions[];
}

@Component({
  selector: 'app-main2',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule, HighchartsChartModule, MatCardModule],
  templateUrl: './main2.component.html',
  styleUrl: './main2.component.scss'
})

export class Main2Component implements AfterViewInit{
  constructor(private mainService: MainServiceService){}




// json: JsonObject = {};
  sortAscending: boolean = false; // Set to false for descending order
  assemblyMinutesAgo: number = 0;
  parliamentMinutesAgo: number = 0;
  intervalId: any;

  assemblyData: JsonObject = {}
  parliamentData: JsonObject = {}

  //loaders
  loadingConstituencies:boolean = true;

  //data view types
  currentDataViewTypes: string = 'table';

  //highcharts
  Highcharts: typeof Highcharts = Highcharts;
  Highcharts1: typeof Highcharts = Highcharts;

  chartRef: Highcharts.Chart | undefined;
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bar',
      backgroundColor: '#f6fff8', // Background color
      borderColor: '#ccc', // Border color
      borderWidth: 1, // Border width
      borderRadius: 10 // Border radius
    },
    title: {
      text: 'Current Top 5 Results'
    },
    yAxis: {
      title: {
        text: 'Total Votes Secured'
      },
    },
    xAxis: {
      title: {
        text: 'Candidate Name'
      },
      categories: []
    },
    series: [{
      type: 'bar',
      data: []
    }]
  }

  pieChartRef: Highcharts.Chart | undefined;
  pieChartOptions: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: '#f6fff8', // Background color
      borderColor: '#ccc', // Border color
      borderWidth: 1, // Border width
      borderRadius: 10 // Border radius
    },
    title: {
      text: 'Vote Share by Party'
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %'
        }
      }
    },
    series: [{
      type: 'pie',
      name: 'Vote Share',
      data: [ ]
    }]
  }
  //highcharts

  ngOnInit() {
    this.getAssemblyData()
  }

  ngAfterViewInit(): void {
    this.chartRef = Highcharts.chart('container', this.chartOptions);
  }

  getCandidatesGraphData(data: any){
    const sortedData = data.sort((a: any, b: any) => b[2] - a[2]).slice(0, 5);

    const seriesData = sortedData.map((item: any) => ({ name: item[0], y: Number(item[2]) }));
  
    const series: SeriesBarOptions[] = [{
      type: 'bar',
      data: seriesData
    }];
  
    (this.chartOptions as ChartOptions).xAxis.categories = sortedData.map((item: any) => item[0]);
    (this.chartOptions as ChartOptions).series = series;
  
    if (this.chartRef) {
      this.chartRef.update(this.chartOptions);
    }
  }

  getPartyGraphData(data: any){
    const sortedData = data.sort((a: any, b: any) => b[2] - a[2]).slice(0, 5);

    const seriesData = sortedData.map((item: any) => ({ name: item[1], y: Number(item[2]) }));
  
    const series: SeriesPieOptions[] = [{
      type: 'pie',
      name: 'Vote Share',
      data: seriesData
    }];
  
    (this.pieChartOptions as Highcharts.Options).series = series;
  
    if (this.pieChartRef) {
      this.pieChartRef.update(this.pieChartOptions);
    }
  }

  primaryButtons: string[] = ['Assembly Constituency', 'Parliament Constituency'];
  secondaryButtons: Constituency[] = []

  activePrimaryButton: string = this.primaryButtons[0];
  activeSecondaryButton: string = '';


  changeView(view:string){
    this.currentDataViewTypes = view;
  }
  
  setActivePrimaryButton(button: string): void {
    this.activePrimaryButton = button;
    button=="Parliament Constituency" ? this.getParliamentData() : this.getAssemblyData();
  }

  refreshData(){
    this.setActivePrimaryButton(this.activePrimaryButton);
  }

  setActiveSecondaryButton(button: string): void {
    this.activeSecondaryButton = button;
  }
  @ViewChild('barChart')
  barChart!: ElementRef;
  ctx: CanvasRenderingContext2D | null = null; // Initialize with null


  candidates = [
   ['Candidate Name ', 'Candidate Party Name','0']
  ];



  getAssemblyData(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    try {
      this.loadingConstituencies = true;

      let startTime = new Date();

      // Reset assemblyMinutesAgo and start a new interval
      this.assemblyMinutesAgo = 0;
      this.intervalId = setInterval(() => this.assemblyMinutesAgo++, 60000);
      const apiRequest = this.mainService.getAssemblyData();
      apiRequest.subscribe({
        next: data=>{
          this.secondaryButtons =[]
          this.assemblyData={}
          for(let each of data){
            this.secondaryButtons.push({
              name: each.range.split('!')[0].replace(/'/g, ""),
              range: each.range
            })
            let name = each.range.split('!')[0].replace(/'/g, "");
            this.assemblyData[name] = each.values
          }

          if(this.secondaryButtons && this.secondaryButtons.length > 0){
            this.getConstituencyData(this.secondaryButtons[0])
          }
          let endTime = new Date();
          this.assemblyMinutesAgo =  Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

          this.loadingConstituencies = false;
        },
        error:e=>{
          console.error(e);
          this.loadingConstituencies = false;
        }
      })
    } catch (error) {
      console.error(error);
      this.loadingConstituencies = false;
    }
  }
 
  getParliamentData(){
    try {
      this.loadingConstituencies = true;

      let startTime = new Date();
      this.parliamentMinutesAgo = 0;
      this.intervalId = setInterval(() => this.parliamentMinutesAgo++, 60000);
      const apiRequest = this.mainService.getParliamentData();
      apiRequest.subscribe({
        next: data=>{
          this.secondaryButtons =[]
          this.parliamentData={}
          for(let each of data){
            this.secondaryButtons.push({
              name: each.range.split('!')[0],
              range: each.range
            })
            let name = each.range.split('!')[0];
            this.parliamentData[name] = each.values
          }
          
          if(this.secondaryButtons && this.secondaryButtons.length > 0){
            this.getConstituencyData(this.secondaryButtons[0])
          }
          
          let endTime = new Date();
          this.assemblyMinutesAgo =  Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

          this.loadingConstituencies = false;
        },
        error:e=>{
          console.error(e)
          this.loadingConstituencies = false;
        }
      })
    } catch (error) {
      console.error(error)
      this.loadingConstituencies = false;
    }
  }

  getConstituencyData(btn: any){
    // let object = this.parliamentData.find(obj => obj["range"].split('!')[0] === btn)
    this.activeSecondaryButton = btn.name;
    if(this.activePrimaryButton == "Parliament Constituency"){
      const dataKey = btn.name; 
      this.candidates = []

      if (this.parliamentData[dataKey]) {
        let sortedData = this.parliamentData[dataKey].slice().sort((a: any, b: any) => {
          const voteCountA = parseInt(a[a.length - 1].replace(/,/g, ''), 10);
          const voteCountB = parseInt(b[b.length - 1].replace(/,/g, ''), 10);
          return voteCountB - voteCountA;
        });
        this.candidates = [];
        this.candidates = [...sortedData]
      }

  

      // this.candidates = this.parliamentData[btn.name]
      this.sortData();
      this.calculateLeadByCount();
    }
    else {
      const dataKey = btn.name; 
      this.candidates = [];
      
      if (this.assemblyData[dataKey]) {
        let sortedData = this.assemblyData[dataKey].slice().sort((a: any, b: any) => {
          const voteCountA = parseInt(a[a.length - 1].replace(/,/g, ''), 10);
          const voteCountB = parseInt(b[b.length - 1].replace(/,/g, ''), 10);
          return voteCountB - voteCountA;
        });
        this.candidates = [];
        this.candidates = [...sortedData]
      }
      
      // this.candidates = this.assemblyData[btn.name];
      this.sortData();
      this.calculateLeadByCount();
    }


    this.getCandidatesGraphData(this.candidates);
    this.getPartyGraphData(this.candidates);
  }

  getImageUrl(can: any){
    let a = '';
    if(this.activePrimaryButton == "Parliament Constituency")
      a = 'PC'
    else 
      a = 'AC'
     if(a=='AC') return `https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${this.activeSecondaryButton}/${can}.jpg`.replace(/ /g, '%20')
      else return`https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${can}.jpg`.replace(/ /g, '%20')
   
  }

  sortData() {
    // this.candidates.sort((a: any[], b: any[]) => {
    //   let numA = parseFloat(a[2]);
    //   let numB = parseFloat(b[2]);
    //   return this.sortAscending ? numA - numB : numB - numA;
    // });
    // this.sortAscending = !this.sortAscending;
  }

  calculateLeadByCount(){
    let totalVotes = this.candidates.reduce((total, candidate) => total + parseFloat(candidate[2].replace(/,/g, "")), 0);
    this.candidates.forEach(candidate => {
      let votes = parseFloat(candidate[2].replace(/,/g, ""));
      let votePercentage = ((votes / totalVotes) * 100);
      votePercentage = isNaN(votePercentage) ? 0 : parseFloat(votePercentage.toFixed(2));
      candidate.push(votePercentage.toString()); // Added the VotePercentage to each candidate
    });
  }
  
}
