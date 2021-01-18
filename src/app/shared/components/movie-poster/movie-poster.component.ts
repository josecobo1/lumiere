import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Movie } from 'src/app/common/interfaces/movies/movie';

@Component({
  selector: 'app-movie-poster',
  templateUrl: './movie-poster.component.html',
  styleUrls: ['./movie-poster.component.scss'],
})
export class MoviePosterComponent implements OnInit {

  @Input() movie: Movie;
  @Output() movieDetail = new EventEmitter<Movie>();

  constructor() { }

  ngOnInit() {}

  getDetails(movie) {
    this.movieDetail.emit(movie);
  }

}
