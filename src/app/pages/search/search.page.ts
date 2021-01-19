import { Component, OnInit } from '@angular/core';
import { MoviesService } from 'src/app/core/services/movies.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  query: string;
  movies: any;

  constructor(private movieService: MoviesService) { }

  ngOnInit() {
  }

  async search(){
    this.movies = await this.movieService.searchMoviesByTitle(this.query).pipe().toPromise();
  }

  cancel(){
    console.log('cancel');
    this.movies = [];
  }

}
