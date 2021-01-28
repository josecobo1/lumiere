import { ListsService } from 'src/app/core/services/lists.service';
import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { CastService } from 'src/app/core/services/cast.service';
import { MoviesService } from 'src/app/core/services/movies.service';
import { UserService } from 'src/app/core/services/user.service';
import { ModalMovieDetailsComponent } from '../modal-movie-details/modal-movie-details.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-movies-by-cast',
  templateUrl: './movies-by-cast.component.html',
  styleUrls: ['./movies-by-cast.component.scss'],
})
export class MoviesByCastComponent implements OnInit {

  cast: any;
  castDetails: any;

  // Información que necesito antes de abrir el modal
  isLogged: boolean; // sesión usuario
  user: any; // Objeto completo del usuario
  movie: any; // objeto completo de la película
  images: any; // Imagenes de la película
  collections: any; // obeto completo de las coleccions del usuario
  region: any; // País dónde está el usuario ahora mismo
  //cast: any; // Repart de la película
  platforms: any; // Plataformas dónde ver una película
  isSeen: boolean; // El usuario ha marcado la película como vista
  isSaved: boolean; // El usuario ha marcado la película como ver depués
  actionSheetOptions: any; // Acciones del actionsheet

  constructor(public modalController: ModalController, 
              private listsService: ListsService, 
              public loadingContoller: LoadingController,
              public castService: CastService,
              public authService: AuthService,
              public userService: UserService,
              public moviesService: MoviesService) { }

  async ngOnInit() {
    this.cast = history.state;
    console.log(history.state);
    await this.getCastDetails();
    console.log(this.castDetails);
  }

  async presentModal(movie){

    let images;

    const loading = await this.loadingContoller.create({
      message: 'Loading',
      translucent: true
    });

    await loading.present();

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
      images = [];
      console.log(`Esta película no tiene imagenes`);
    } finally {
      loading.dismiss();
    }

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

    return await modal.present();
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

  async getCastDetails(){
    console.log('get details');
    console.log('cast: ', this.cast.id);
    this.castDetails = await this.castService.getCastInfo(this.cast.id).pipe().toPromise();
  }

  slideOpts = {
    slidesPerView: 2.5,
    spaceBetween: 10,
    autoHeight: true
  }

}
