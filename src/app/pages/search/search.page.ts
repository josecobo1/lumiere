import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { MoviesService } from 'src/app/core/services/movies.service';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {

  query: string;
  queryBk: string = '';
  movies: any;
  searchCriteria: string;
  reference = 'title';
  region; 

  pageCounter = 1;
  lastPage = null;

  results: any;
  titleResults: any = [];
  castResults: any = [];
  collectionsResult: any = [];

  @ViewChild(IonContent, { static: false}) content: IonContent;
  constructor(private movieService: MoviesService, 
              public modalController: ModalController, 
              private router: Router,
              public geolocation: GeolocationService,
              public loadingController: LoadingController,
              public toastController: ToastController,
              public listsService: ListsService) { }

  ngOnInit() {
  }

  fab(){
    alert('fab button');
  }

  logScrollStart(){}
  logScrolling(event){}
  logScrollEnd(){}
  scrollToTop(){
    this.content.scrollToTop(1000);
  }



  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async search(){

    if(this.query.length > 0) {
      if(this.query != this.queryBk) {
        this.queryBk = this.query;
      }
      console.log(this.queryBk != this.queryBk);
      console.log('query;', this.query);
      console.log('bk:', this.queryBk);

      const loading = await this.loadingController.create({
        message: 'Loading',
        translucent: true
      });
  
      await loading.present();
  
      try {
        this.titleResults = await this.movieService.searchMoviesByTitle(this.queryBk, this.pageCounter).pipe().toPromise();
        this.castResults = await this.movieService.searchMoviesByCast(this.queryBk, this.pageCounter).pipe().toPromise();
        this.collectionsResult = await this.listsService.searchLists(this.queryBk);
        this.results = {
          title: this.titleResults,
          cast: this.castResults,
          collections: this.collectionsResult
        };
        console.log('resultados búsqueda', this.results);
      } catch (error) {
        this.presentToast('Something went worong try again later');
      } finally {
        loading.dismiss();
      }
    }

  }

  cancel(){
    console.log('cancel');
    this.pageCounter = 1; // al cambiar el creiterio de busca reinicio el contador de pàginas
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
      //images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
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
        region: this.region
      }
    });

    return await modal.present();
  }

  segmentChange(event){
    console.log(event.detail.value);
    this.pageCounter = 1; // al cambiar el creiterio de busca reinicio el contador de pàginas
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
      this.getMore(event);
    }
    
  }

  async getMoreResults(event?){
    // this.titleResults = await this.movieService.searchMoviesByTitle(this.query, this.pageCounter).pipe().toPromise();
    // this.lastPage = parseInt(this.movies.total_pages);
    if(this.queryBk.length > 0 && this.query.length > 0){
      console.log('get more results');
      if(this.pageCounter == this.lastPage){
        event.target.disabled = true;
      } else {
        this.pageCounter++;
        this.getMore(event);
      }
    }
    
  }

  async getMore(event){
    console.log('criterio:', this.searchCriteria);
    try {
      if(this.reference == 'title'){
        const movies = await this.movieService.searchMoviesByTitle(this.queryBk, this.pageCounter).pipe().toPromise();
        this.titleResults.results.push(...movies.results);
      } else if(this.reference == 'cast') {
        const cast = await this.movieService.searchMoviesByCast(this.queryBk, this.pageCounter).pipe().toPromise();
        this.castResults.results(...cast.results);
      }
      if(event){
        event.target.complete();
      }    
    } catch (error) {
      this.presentToast('Something went wrong please try again later');
    }
  
  }
  
  castPageCounter: number = 1;
  
  async getMorePeope(event?){
    if(this.queryBk.length > 0 && this.query.length > 0){
      console.log('get more people');
      if(this.castResults.page == this.castResults.total_pages){
        event.target.disabled = true;
      } else {
        this.castPageCounter++;
        this.getMoreCast(event);
      }
    }
  }

  async getMoreCast(event){
    try {
      const cast = await this.movieService.searchMoviesByCast(this.queryBk, this.castPageCounter).pipe().toPromise(); 
      this.castResults.results.push(...cast.results);
      if(event){
        event.target.complete();
      }
    } catch (error) {
      console.log(error);
    }
  }

}
