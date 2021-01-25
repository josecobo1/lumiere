import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Movie } from '../model/movies/movie';
import { UpcomingMovies } from '../model/movies/upcoming-movies';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  api_url = environment.theMovieDataBaseAPI.API_URL;
  api_key = environment.theMovieDataBaseAPI.API_KEY;

  constructor(private http: HttpClient) { }

  // https://api.themoviedb.org/3/movie/upcoming?api_key=5d8c3de3e2543b591b9b443d64c7b56f&region=ES
  // https://api.themoviedb.org/3/movie/upcoming?api_key=5d8c3de3e2543b591b9b443d64c7b56&region=ES
  getUpcomingMovies$(region): Observable<UpcomingMovies> {
    console.log(`${this.api_url}/movie/upcoming?${this.api_key}&region=${region}`);
    return this.http.get<UpcomingMovies>(`${this.api_url}/movie/upcoming?${this.api_key}&region=${region}`);
  }


  // https://api.themoviedb.org/3/search/movie?api_key=5d8c3de3e2543b591b9b443d64c7b56f&query=kill+bill
  searchMoviesByTitle(query: string, page: any): Observable<any> {
    console.log(`Search by title page: ${this.api_url}/search/movie?${this.api_key}&query=${query}&page=${page}`);
    return this.http.get<any>(`${this.api_url}/search/movie?${this.api_key}&query=${query}&page=${page}`);
  }

  // https://api.themoviedb.org/3/search/person?api_key=5d8c3de3e2543b591b9b443d64c7b56f&query=quentin+tarantino
  // https://api.themoviedb.org/3/search/person?api_key=5d8c3de3e2543b591b9b443d64c7b56f&query=ana
  // https://api.themoviedb.org/3/search/person?api_key=5d8c3de3e2543b591b9b443d64c7b56f&query=ana
  searchMoviesByCast(query: string): Observable<any> {
    console.log('busca por cast en el service');
    console.log(`${this.api_url}/search/person?${this.api_key}&query=${query}`);
    return this.http.get<any>(`${this.api_url}/search/person?${this.api_key}&query=${query}`);
  }

  // https://api.themoviedb.org/3/discover/movie?api_key=5d8c3de3e2543b591b9b443d64c7b56f&with_genres=28
  searchMoviesByGenre(genre: string): Observable<any> {
    return this.http.get<any>(`${this.api_url}/discover/movie?${this.api_key}&with_genres=28`);
  }

  // https://api.themoviedb.org/3/discover/movie?api_key=5d8c3de3e2543b591b9b443d64c7b56f&sort_by=release_date.asc&primary_release_year=2001&page=295
  searchMoviesByYear(year: string): Observable<any> {
    return this.http.get<any>(`${this.api_url}/discover/movie?${this.api_key}&sort_by=release_date.asc&primary_release_year=${year}`);
  }

  // https://api.themoviedb.org/3/movie/24/images?api_key=5d8c3de3e2543b591b9b443d64c7b56f
  getMovieImages(id): Observable<any> {
    return this.http.get<any>(`${this.api_url}/movie/${id}/images?${this.api_key}`);
  }

  // https://api.themoviedb.org/3/movie/24?api_key=5d8c3de3e2543b591b9b443d64c7b56f
  getMovieById(id): Observable<Movie> {
    return this.http.get<Movie>(`${this.api_url}/movie/${id}?${this.api_key}`);
  }

  // Devuelve plataformas donde ver una película
  // https://api.themoviedb.org/3/movie/464052/watch/providers?api_key=5d8c3de3e2543b591b9b443d64c7b56f
  whereToWatch(id): Observable<any> {
    return this.http.get<any>(`${this.api_url}/movie/${id}/watch/providers?${this.api_key}`);
  }

  // Devuelve la lista de generos y su id
  // https://api.themoviedb.org/3/genre/movie/list?api_key=5d8c3de3e2543b591b9b443d64c7b56f
  getGenresList(): Observable<any> {
    console.log(`${this.api_url}/genre/movie/list?${this.api_key}`);
    return this.http.get<any>(`${this.api_url}/genre/movie/list?${this.api_key}`);
  }

}
