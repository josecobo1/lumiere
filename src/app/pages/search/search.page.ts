import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  query: string;
  movies: any;
  searchCriteria: string;
  reference = 'title';
  region; 

  constructor(private movieService: MoviesService, 
              public modalController: ModalController, 
              private router: Router,
              public geolocation: GeolocationService) { }

  ngOnInit() {
  }

  async search(){

    if(this.query && this.query.length > 0){

      switch(this.reference){
        case ('title'):
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByTitle(this.query).pipe().toPromise();
          break;
        case('cast'):
          console.log('busca por cast');
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByCast(this.query).pipe().toPromise();
          console.log(this.movies.results);
          break;
        case('year'):
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByYear(this.query).pipe().toPromise();
      }

    }

  }

  cancel(){
    console.log('cancel');
    this.movies = [];
  }

  async presentModal(movie){

    let images; 
    let platforms;

    try {
      // Antes de mostrat el modal con los detalles de la película busco las imagenes de la película
      images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
      platforms = await this.movieService.whereToWatch(movie.id).pipe().toPromise();
      this.region = await this.geolocation.getCurrentLocation();
      platforms = platforms.results[this.region];
      console.log('platforms', platforms);
    } catch (error) {
      console.log(`No se han encontrado imagenes de esta película`);
      images = [];
    }

    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie,
        images: images,
        platforms: platforms
      }
    });

    return await modal.present();
  }

  segmentChange(event){
    console.log(event.detail.value);
    this.reference = event.detail.value;
    this.search();
  }

  getMovieList(cast){
    console.log(cast.known_for);
    this.router.navigate(['tabs/search/cast'], {state: cast});
  }

}
