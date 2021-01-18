import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UpcomingMovies } from '../interfaces/movies/upcoming-movies';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  api_url = environment.API_URL;
  api_key = environment.API_KEY;

  constructor(private http: HttpClient) { }

  // https://api.themoviedb.org/3/movie/upcoming?api_key=5d8c3de3e2543b591b9b443d64c7b56f&region=ES
  // https://api.themoviedb.org/3/movie/upcoming?api_key=5d8c3de3e2543b591b9b443d64c7b56&region=ES
  getUpcomingMovies$(): Observable<UpcomingMovies> {
    console.log(`${this.api_url}/movie/upcoming?${this.api_key}&region=ES`);
    return this.http.get<UpcomingMovies>(`${this.api_url}/movie/upcoming?${this.api_key}&region=ES`);
  }
}
