import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
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

  constructor(private movieService: MoviesService, public modalController: ModalController, private router: Router) { }

  ngOnInit() {
  }

  async search(){

    if(this.query && this.query.length > 0){

      switch(this.reference){
        case ('title'):
          console.log('busca por title');
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByTitle(this.query).pipe().toPromise();
          break;
        case('cast'):
          console.log('busca por cast');
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByCast(this.query).pipe().toPromise();
          console.log(this.movies.results);
          break;
        case('genre'):
          this.movies = [];
          this.movies = await this.movieService.searchMoviesByGenre(this.query).pipe().toPromise();
      }

    }

  }

  cancel(){
    console.log('cancel');
    this.movies = [];
  }

  async presentModal(movie){

    // ANtes de mostrat el modal con los detalles de la película busco las imagenes de la película
    const images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
    console.log(images);
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie,
        images: images
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
