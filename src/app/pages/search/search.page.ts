import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
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

  pageCounter = 1;
  lastPage = null;

  constructor(private movieService: MoviesService, 
              public modalController: ModalController, 
              private router: Router,
              public geolocation: GeolocationService,
              public loadingController: LoadingController,
              public toastController: ToastController) { }

  ngOnInit() {
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async search(){

    const loading = await this.loadingController.create({
      message: 'Loading',
      translucent: true
    });

    await loading.present();

    try {
      if(this.query && this.query.length > 0){

        switch(this.reference){
          case ('title'):
            this.movies = [];
            this.movies = await this.movieService.searchMoviesByTitle(this.query, this.pageCounter).pipe().toPromise();
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

    } catch (error) {
      this.presentToast('Something went worong try again later');
    } finally {
      loading.dismiss();
    }

  }

  cancel(){
    console.log('cancel');
    this.movies = [];
  }

  async presentModal(movie){

    let images; 
    let platforms;

    const loading = await this.loadingController.create({
      message: 'Loading',
      translucent: true
    });

    await loading.present();

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
    } finally {
      loading.dismiss();
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

  loadMoreMovies(event) {

    if(this.pageCounter == this.lastPage){
      event.target.disabled = true;
    } else {
      this.pageCounter++;
      this.getMoreMoviesByTitle(event);
    }
    
  }

  async getMoviesByTitle(event?){
    this.movies = await this.movieService.searchMoviesByTitle(this.query, this.pageCounter).pipe().toPromise();
    this.lastPage = parseInt(this.movies.total_pages);
  }

  async getMoreMoviesByTitle(event){

    try {
      const movies = await await this.movieService.searchMoviesByTitle(this.query, this.pageCounter).pipe().toPromise();
      this.movies.results.push(...movies.results);
      if(event){
        event.target.complete();
      }    
    } catch (error) {
      this.presentToast('Something went wrong please try again later');
    }
  
  }

}
