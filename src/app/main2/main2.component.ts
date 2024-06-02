import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

//services
interface JsonObject {
  [key: string]: any; // This allows you to use any string as a key with any type of value.
}

interface Constituency {
  name: string;
  range: string;
}
import { MainServiceService } from '../main-service.service';
@Component({
  selector: 'app-main2',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatProgressSpinnerModule],
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

  //loaders
  loadingConstituencies:boolean = true;

  //data view types
  currentDataViewTypes: string = 'table';

  ngOnInit() {
    this.getAssemblyData()
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
    console.log(button)
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
          }

          console.log("*** ", this.secondaryButtons)
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
      console.log(error);
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
      console.log(error)
      this.loadingConstituencies = false;
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
