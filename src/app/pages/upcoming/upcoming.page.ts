import { MoviesService } from './../../core/services/movies.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { UpcomingMovies } from 'src/app/core/model/movies/upcoming-movies';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import { UserService } from 'src/app/core/services/user.service';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';
import { ListsService } from 'src/app/core/services/lists.service';

@Component({
  selector: 'app-upcoming',
  templateUrl: './upcoming.page.html',
  styleUrls: ['./upcoming.page.scss'],
})
export class UpcomingPage implements OnInit {

  constructor(private moviesService: MoviesService, 
              public modalController: ModalController,
              public geolocationService: GeolocationService,
              public toastController: ToastController,
              public loadingController: LoadingController,
              public authService: AuthService,
              public userService: UserService,
              public listsService: ListsService) { }

  upcomingMovies: UpcomingMovies;
  

  // Información que necesito antes de abrir el modal
  isLogged: boolean; // sesión usuario
  user: any; // Objeto completo del usuario
  movie: any; // objeto completo de la película
  images: any; // Imagenes de la película
  collections: any; // obeto completo de las coleccions
  region: any; // País dónde está el usuario ahora mismo
  cast: any; // Repart de la película
  platforms: any; // Plataformas dónde ver una película
  isSeen: boolean; // El usuario ha marcado la película como vista
  isSaved: boolean; // El usuario ha marcado la película como ver depués
  actionSheetOptions: any; // Acciones del actionsheet

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

  // Recupera todos los detalles de la película
  async getDetails(movie) {

     // Muestra el spinner de carga
     const loading = await this.loadingController.create({
      message: 'Loading...',
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

  // Al iniciar busco la ubicación del usuario y los próximos estrenos para el país
  async ngOnInit() {

    // Muestra el spinner de carga
    const loading = await this.loadingController.create({
      message: 'Loading...',
      translucent: true
    });

    await loading.present();

    try {
      // Ubicación del usuario
      this.region = await this.geolocationService.getCurrentLocation();

      // Recupero las nuevas películas para el pís del usuario
      this.upcomingMovies = await this.moviesService.getUpcomingMovies$(this.region).pipe().toPromise();
      
    } catch (error) {
      console.log('error', error);
    } finally {
      // Desactiva el spinner
      loading.dismiss();
    }

    // const loading = await this.loadingController.create({
    //   translucent: true
    // });

    // await loading.present();
    // try {
    //   console.log('bloque try del onInit');
    //   await this.getRegion();
    //   console.log('despues de la region');
    //   await this.getUpcomingMovies();
    // } catch (error) {
    //   this.presentToast('Oops somethign went wrong please try later');
    // } finally {
    //   loading.dismiss();
    // }

  }

}
