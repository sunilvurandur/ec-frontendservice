import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class MainServiceService {

  private backendurl: string = 'https://ec-backendservice.onrender.com'
  constructor(private http: HttpClient) { }

  getAssemblyData(): Observable<any>{
    console.log('coming herer')
    return this.http.post(`${this.backendurl}/assembly`, {});
  }
  getParliamentData(): Observable<any>{
    console.log('coming herer')
    return this.http.post(`${this.backendurl}/parliament`, {});
  }
}
