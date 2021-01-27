import { MoviesService } from './../../core/services/movies.service';
import { first } from 'rxjs/operators';
import { UserService } from 'src/app/core/services/user.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
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

  // OLD
  query: string = '';
  queryBk: string = '';
  searchCriteria: string;
  reference = 'title';
  
  //////////////////////////////////

  // Información que necesito antes de abrir el modal
  isLogged: boolean; // sesión usuario
  user: any; // Objeto completo del usuario
  movie: any; // objeto completo de la película
  images: any; // Imagenes de la película
  collections: any; // obeto completo de las coleccions del usuario
  region: any; // País dónde está el usuario ahora mismo
  cast: any; // Repart de la película
  platforms: any; // Plataformas dónde ver una película
  isSeen: boolean; // El usuario ha marcado la película como vista
  isSaved: boolean; // El usuario ha marcado la película como ver depués
  actionSheetOptions: any; // Acciones del actionsheet

  // Resultados de la búsqueda
  movies: any;
  people: any;
  collectionsSearch: any;
  searchResults: any;

  // Paginación de los resultados
  moviesPageCounter: number = 1;
  castPageCounter: number = 1;


  @ViewChild(IonContent, { static: false}) content: IonContent;
  constructor(private moviesService: MoviesService, 
              public modalController: ModalController, 
              private router: Router,
              public geolocation: GeolocationService,
              public loadingController: LoadingController,
              public toastController: ToastController,
              public listsService: ListsService,
              public authService: AuthService,
              public userService: UserService) { }

  // Al iniciar recupero país actual y si el usuario ha iniciado sesión
  // recupero el objeto de la base de datos
  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Loading...',
      translucent: true
    });

    await loading.present()
    
    try {
      // Recupero la ubicación del usuario
      this.isLogged = await this.authService.isLogged();

      // Comprueo si el usuario ha iniciado sesión, si hay sesión
      // recupero el objeto de la base de datos
      if(this.isLogged) {
        const uid = await this.authService.getUserId();
        this.user = await this.userService.getUser(uid).pipe(first()).toPromise();
      }
      
    } catch (error) {
      console.log('error', error);
    } finally {
      loading.dismiss();
    }
    
  }

  // Scroll hasta arriba
  scrollToTop(){
    this.content.scrollToTop(1000);
  }

  // Función de búsqueda
  async search(){

    // Si no hay nada en el campo de búsqueda no hacemos nada
    if(this.query.length > 0) {
      if(this.query != this.queryBk) {
        this.queryBk = this.query;
      }
      
      // Inicia el spinner
      const loading = await this.loadingController.create({
        message: 'Loading',
        translucent: true
      });
  
      await loading.present();
  
      try {
        // Resultador por título
        this.movies = await this.moviesService.searchMoviesByTitle(this.queryBk, this.moviesPageCounter).pipe().toPromise();

        // Buscar resultados para la búsqueda
        this.people = await this.moviesService.searchMoviesByCast(this.queryBk, this.castPageCounter).pipe().toPromise();

        // Buscar colecciones por nombre
        this.collectionsSearch = await this.listsService.searchLists(this.queryBk);

        // Resultados de la búsqueda
        this.searchResults = {
          title: this.movies,
          cast: this.people,
          collections: this.collectionsSearch
        }

      } catch (error) {
        this.toast('Something went wrong try again later');
      } finally {
        loading.dismiss();
        console.log(this.searchResults);
      }
    }

  }

  // Genera opciones para el action sheet del modal
  generateActionSheetOptions(collections: any) {
    const options = collections.map(c => {
      return {
        text: c.name,
        handler: () => {
          console.log(this.movie.id);
        }
      }
    });
    return options;
  }

  // Recupera toda la info necesaria antes de mostrar el modal con los detalles de
  // la película
  async getDetails(movie) {

    // Muestra el spinner de carga
    const loading = await this.loadingController.create({
      message: 'loading...',
      translucent: true
    });

    loading.present();

    try {
      // Ha iniciado sesion el usuario
      this.isLogged = await this.authService.isLogged();

      // Si ha iniciado sesión recupero su informació de la base de datos
      // i todas las colecciones que tiene (solo las que es propietario)
      if(this.isLogged) {
        const uid = await this.authService.getUserId();
        this.user = await this.userService.getUser(uid).pipe(first()).toPromise();
        this.collections = await this.listsService.getUserOwnedLists(uid).pipe(first()).toPromise();
        console.log('collections', this.collections);

        // Comprueva si el usuario ha vista la película
        this.isSeen = this.user.seen.some(s => s.movie == movie.id);

        // Comprueva si el usuario ha guardado la película
        this.isSaved = this.user.saved.some(s => s.movie == movie.id);
      }
      
      // Recupero todos los detalles de la película con la API
      this.movie = await this.moviesService.getMovieById(movie.id).pipe().toPromise();

      // Recupero todas las imagenes de esa película
      this.images = await this.moviesService.getMovieImages(movie.id).pipe().toPromise();

      // Recupera el reparto de una película
      this.cast = await this.moviesService.getCast(movie.id).pipe().toPromise();

      // Recuper el listado dónde ver una película
      this.platforms = await this.moviesService.whereToWatch(movie.id).pipe().toPromise();

      // Genera opciones del actionsheet
      this.actionSheetOptions = this.generateActionSheetOptions(this.collections);
      console.log(this.actionSheetOptions);


      
    } catch (error) {
      console.log('error', error);
    } finally {
      // Desactiva el spinner
      loading.dismiss();
    }

    // Muestra el modal con los detalles
    this.presentDetails();
  }

  // Modal con los detalles de la película
  async presentDetails() {
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        isLogged: this.isLogged,
        movie: this.movie,
        images: this.images,
        user: this.user,
        collections: this.collections,
        cast: this.cast,
        platforms: this.platforms,
        isSeen: this.isSeen,
        isSaved: this.isSaved,
        actionsSheetOptionns: this.actionSheetOptions
      },
      swipeToClose: true
    });

    await modal.present();

    modal.onWillDismiss().then(data => {
      console.log(data);
    });
  }

  async toast(message){
    const toast = await this.toastController.create({
      message: message,
      duration: 500
    });
    toast.present();
  }

  segmentChange(event){
    console.log(event.detail.value);
    this.reference = event.detail.value;
    this.search();
  }

  getMoreMovies(event?){
    if (this.queryBk.length > 0 && this.query.length > 0) {
      if (this.movies.page == this.movies.total_pages) {
        event.target.disabled = true;
      } else {
        this.moviesPageCounter++;
        this.moreMovies(event);
      }
    }
  }

  getMorePeople(event?){
    if (this.queryBk.length > 0 && this.query.length > 0) {
      if (this.people.page == this.people.total_pages) {
        event.target.disabled = true;
      } else {
        this.castPageCounter++;
        this.moreCast(event);
      }
    }
  }

  async moreMovies(event){
    try {
      const movies = await this.movieService
        .searchMoviesByTitle(this.queryBk, this.moviesPageCounter)
        .pipe()
        .toPromise();
      this.movies.results.push(...movies.results);
      if (event) {
        event.target.complete();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async moreCast(event?){
    try {
      const cast = await this.movieService
        .searchMoviesByCast(this.queryBk, this.castPageCounter)
        .pipe()
        .toPromise();
        this.people.results.push(...cast.results);
        if(event){
          event.target.complete()
        }
    } catch (error) {
      console.log(error);
    } 
  }

  cancel(){
    console.log('cancel');
    this.moviesPageCounter = 1; // al cambiar el creiterio de busca reinicio el contador de pàginas
    this.castPageCounter = 1;
    this.movies = [];
  }


  // details(event){
  //   console.log(event);
  // }

  // async presentModal(movie){

  //   let images; 
  //   let platforms;
  //   console.log(movie);

  //   const loading = await this.loadingController.create({
  //     message: 'Loading',
  //     translucent: true
  //   });

  //   await loading.present();

  //   try {
  //     // Antes de mostrat el modal con los detalles de la película busco las imagenes de la película
  //     //images = await this.movieService.getMovieImages(movie.id).pipe().toPromise();
  //     platforms = await this.movieService.whereToWatch(movie.id).pipe().toPromise();
  //     this.region = await this.geolocation.getCurrentLocation();
  //     platforms = platforms.results[this.region];
  //     console.log('platforms', platforms);
  //   } catch (error) {
  //     console.log(`No se han encontrado imagenes de esta película`);
  //     images = [];
  //   } finally {
  //     loading.dismiss();
  //   }

  //   const modal = await this.modalController.create({
  //     component: ModalMovieDetailsComponent,
  //     componentProps: {
  //       movie: movie,
  //       region: this.region
  //     }
  //   });

  //   return await modal.present();
  // }

  // segmentChange(event){
  //   console.log(event.detail.value);
  //   this.pageCounter = 1; // al cambiar el creiterio de busca reinicio el contador de pàginas
  //   this.reference = event.detail.value;
  //   this.search();
  // }

  // getMovieList(cast){
  //   console.log(cast.known_for);
  //   this.router.navigate(['tabs/search/cast'], {state: cast});
  // }

  // loadMoreMovies(event) {

  //   if(this.pageCounter == this.lastPage){
  //     event.target.disabled = true;
  //   } else {
  //     this.pageCounter++;
  //     this.getMore(event);
  //   }
    
  // }

  // async getMoreResults(event?){
  //   // this.titleResults = await this.movieService.searchMoviesByTitle(this.query, this.pageCounter).pipe().toPromise();
  //   // this.lastPage = parseInt(this.movies.total_pages);
  //   if(this.queryBk.length > 0 && this.query.length > 0){
  //     console.log('get more results');
  //     if(this.pageCounter == this.lastPage){
  //       event.target.disabled = true;
  //     } else {
  //       this.pageCounter++;
  //       this.getMore(event);
  //     }
  //   }
    
  // }

  // async getMore(event){
  //   console.log('criterio:', this.searchCriteria);
  //   try {
  //     if(this.reference == 'title'){
  //       const movies = await this.movieService.searchMoviesByTitle(this.queryBk, this.pageCounter).pipe().toPromise();
  //       this.titleResults.results.push(...movies.results);
  //     } else if(this.reference == 'cast') {
  //       const cast = await this.movieService.searchMoviesByCast(this.queryBk, this.pageCounter).pipe().toPromise();
  //       this.castResults.results(...cast.results);
  //     }
  //     if(event){
  //       event.target.complete();
  //     }    
  //   } catch (error) {
  //     this.presentToast('Something went wrong please try again later');
  //   }
  
  // }
  
  // castPageCounter: number = 1;
  
  // async getMorePeope(event?){
  //   if(this.queryBk.length > 0 && this.query.length > 0){
  //     console.log('get more people');
  //     if(this.castResults.page == this.castResults.total_pages){
  //       event.target.disabled = true;
  //     } else {
  //       this.castPageCounter++;
  //       this.getMoreCast(event);
  //     }
  //   }
  // }

  // async getMoreCast(event){
  //   try {
  //     const cast = await this.movieService.searchMoviesByCast(this.queryBk, this.castPageCounter).pipe().toPromise(); 
  //     this.castResults.results.push(...cast.results);
  //     if(event){
  //       event.target.complete();
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

}
