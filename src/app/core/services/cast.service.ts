import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CastService {

  api_url = environment.theMovieDataBaseAPI.API_URL;
  api_key = environment.theMovieDataBaseAPI.API_KEY;

  constructor(private http: HttpClient) { }

  // https://api.themoviedb.org/3/person/139?api_key=5d8c3de3e2543b591b9b443d64c7b56f
  getCastInfo(id): Observable<any> {
    console.log('url de la petición', `${this.api_url}/person/${id}?${this.api_key}`);
    return this.http.get<any>(`${this.api_url}/person/${id}?${this.api_key}`);
  }
}
