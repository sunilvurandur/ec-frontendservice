import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
// import {} from '../../assets/AC/DARSI/'

//services
interface JsonObject {
  [key: string]: any; // This allows you to use any string as a key with any type of value.
}
import { MainServiceService } from '../main-service.service';
@Component({
  selector: 'app-main2',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule],
  templateUrl: './main2.component.html',
  styleUrl: './main2.component.scss'
})

export class Main2Component{
  constructor(private mainService: MainServiceService){}


// json: JsonObject = {};
  sortAscending: boolean = false; // Set to false for descending order
  assemblyMinutesAgo: number = 0;
  parliamentMinutesAgo: number = 0;
  intervalId: any;

  assemblyData: JsonObject = {}
  parliamentData: JsonObject = {}
  ngOnInit() {
    console.log('ngonit')
    this.getAssemblyData()
  }

  primaryButtons: string[] = ['Assembly Constituency', 'Parliament Constituency'];
  secondaryButtons=[{'name':"SN PADU'","range":"'SN PADU'"}]

  activePrimaryButton: string = this.primaryButtons[0];
  activeSecondaryButton: string = '';

  setActivePrimaryButton(button: string): void {
    this.activePrimaryButton = button;
    button=="Parliament Constituency" ? this.getParliamentData() : this.getAssemblyData();

  }

  setActiveSecondaryButton(button: string): void {
    console.log(button)
    this.activeSecondaryButton = button;
  }
  @ViewChild('barChart')
  barChart!: ElementRef;
  ctx: CanvasRenderingContext2D | null = null; // Initialize with null


  // ngAfterViewInit(): void {
  //   this.ctx = (this.barChart.nativeElement as HTMLCanvasElement).getContext('2d');

  //   if (this.ctx) { // Checks if ctx is not null
  //     this.drawBarChart();
  //   }
  // }

  candidates = [
   ['Candidate Name ', 'Candidate Party Name','0']
    // Add more data as needed
  ];

  // drawBarChart(): void {
  //   if (!this.ctx) {
  //     return;
  //   }

  //   const candidates = this.dataSource.map(data => data.candidate);
  //   const cumulatives = this.dataSource.map(data => data.cumulative);

  //   new Chart(this.ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: cumulatives,
  //       datasets: [{
  //         label: 'Candidates',
  //         data: candidates,
  //         backgroundColor: 'rgba(75, 192, 192, 0.2)',
  //         borderColor: 'rgba(75, 192, 192, 1)',
  //         borderWidth: 1
  //       }]
  //     },
  //     options: {
  //       scales: {
  //         x: {
  //           title: {
  //             display: true,
  //             text: 'Cumulatives'
  //           }
  //         },
  //         y: {
  //           title: {
  //             display: true,
  //             text: 'Candidates'
  //           }
  //         }
  //       }
  //     }
  //   });
  // }




  getAssemblyData(){
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    try {
      let startTime = new Date();
      console.log('cronssing 1')
      // Reset assemblyMinutesAgo and start a new interval
      this.assemblyMinutesAgo = 0;
      this.intervalId = setInterval(() => this.assemblyMinutesAgo++, 60000);
      const apiRequest = this.mainService.getAssemblyData();
      console.log('cross2')
      apiRequest.subscribe({
        next: data=>{
          console.log(data)
          this.secondaryButtons =[]
          this.assemblyData={}
          for(let each of data){
            this.secondaryButtons.push({
              name: each.range.split('!')[0].replace(/'/g, ""),
              range: each.range
            })
            let name = each.range.split('!')[0].replace(/'/g, "");
            this.assemblyData[name] = each.values
            // Object.assign(this.assemblyData, {name: each.values});

          }
          let endTime = new Date();
          this.assemblyMinutesAgo =  Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

          console.log("---------",this.assemblyData);
        },
        error:e=>{
          console.error(e)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
 
  getParliamentData(){
    try {
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
            // Object.assign(this.assemblyData, {name: each.values});

          }
          
          let endTime = new Date();
          this.assemblyMinutesAgo =  Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

          console.log("---parliamentData------",this.parliamentData);
        

          //updating tables


        },
        error:e=>{
          console.error(e)
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  getConstituencyData(btn: any){
    // let object = this.parliamentData.find(obj => obj["range"].split('!')[0] === btn)
    this.activeSecondaryButton = btn.name
    console.log(btn)
    console.log(this.activePrimaryButton)
    if(this.activePrimaryButton == "Parliament Constituency"){
      this.candidates = this.parliamentData[btn.name]
      this.sortData();
      this.calculateLeadByCount();
    }
    else {
      this.candidates = this.assemblyData[btn.name];
      this.sortData();
      this.calculateLeadByCount();
    }
  }

  getImageUrl(can: any){
    console.log(can);
    console.log(this.secondaryButtons)
    let a = '';
    if(this.activePrimaryButton == "Parliament Constituency")
      a = 'PC'
    else 
      a = 'AC'
    // let url = `https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${this.secondaryButtons}/${can}.jpg`.replace(/ /g, '%20')

    console.log(`https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${this.activeSecondaryButton}/${can}.jpg`.replace(/ /g, '%20'))
     if(a=='AC') return `https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${this.activeSecondaryButton}/${can}.jpg`.replace(/ /g, '%20')
      else return`https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/${a}/${can}.jpg`.replace(/ /g, '%20')
    // return "https://raw.githubusercontent.com/rithvikbanka/ECI-2024/main/Prakasam%20District/Candidate%20Images/AC/DARSI/ARIGELA%20SRINIVASULU.jpg"
  }

  sortData() {
    this.candidates.sort((a: any[], b: any[]) => {
      let numA = parseFloat(a[2]);
      let numB = parseFloat(b[2]);
      return this.sortAscending ? numA - numB : numB - numA;
    });
    this.sortAscending = !this.sortAscending;
  }

  calculateLeadByCount(){
    let totalVotes = this.candidates.reduce((total, candidate) => total + parseFloat(candidate[2]), 0);
    this.candidates.forEach(candidate => {
      let votes = parseFloat(candidate[2]);
      let votePercentage = (votes / totalVotes * 100);
      votePercentage = isNaN(votePercentage) ? 0 : parseFloat(votePercentage.toFixed(2));
      candidate.push(votePercentage.toString()); // Added the VotePercentage to each candidate
    });
  }
  
}
