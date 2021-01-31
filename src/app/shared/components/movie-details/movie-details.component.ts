import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {

  movie: any;
  images: any;
  platforms: any;
  genres: any;
  isSeen: boolean;
  isSaved: boolean;
  cast: any;
  actionSheetOptions: any;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    console.log(history.state);
    this.images = history.state.images;
    this.movie = history.state.movie;
    this.platforms = history.state.platforms;
    this.genres = history.state.genres;
    this.isSaved = history.state.isSaved;
    this.isSeen = history.state.isSeen;
    this.cast = history.state.cast;
    this.actionSheetOptions = history.state.actionSheetOptions;
  }

  addToCollection(){}
  getCast(cast){}

}
