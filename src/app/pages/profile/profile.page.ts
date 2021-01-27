import { MoviesService } from 'src/app/core/services/movies.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from 'src/app/shared/components/login-signup-modal/login-signup-modal.component';
import { ModalMovieDetailsComponent } from 'src/app/shared/components/modal-movie-details/modal-movie-details.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

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

  selector: string = 'seen';
  moviesSeen: any;
  moviesSaved: any;

  seen: any;
  saved: any;
  subscription: Subscription;
  session: any;

  constructor(public modalController: ModalController, 
              public authService: AuthService, 
              public toastController: ToastController,
              public userService: UserService,
              public listsService: ListsService,
              public router: Router,
              public loadingController: LoadingController,
              public moviesService: MoviesService) { }
  
  // Reviso si el usuario ha iniciado sesión y recupero su información
  async ngOnInit(){

    const loading = await this.loadingController.create({
      message: 'Loading...',
      translucent: true
    });

    await loading.present()

    try {
      this.isLogged = await this.authService.isLogged();
      if(this.isLogged){
        const uid = await this.authService.getUserId();
        this.user = await this.userService.getUser(uid).pipe(first()).toPromise();
        console.log(this.user);

        // Busco sus colecciones
        await this.getCollections();
        console.log(this.user);
        this.seen =  await this.getSeenMovies();
        this.saved = await this.getSavedMovies();
      }
    } catch (error) {
      console.log('error', error);
    } finally{
      loading.dismiss();
    }
  }

  // Pestañas
  segmentChanged(event){
    this.selector = event.detail.value;
  }

  // Recupera la lista de colecciones del usuario
  async getCollections(){
    this.collections = await this.listsService.getDetailedLists(this.user.id);
    console.log(this.collections);
  }

  // Recupera toda la info necesaria antes de mostrar el modal con los detalles de
  // la película
  async getDetails(movie) {
    console.log(movie);
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
        this.isSeen = this.user.seen.some(s => s.movie == movie.movie);

        // Comprueva si el usuario ha guardado la película
        this.isSaved = this.user.saved.some(s => s.movie == movie.movie);
      }
      
      // Recupero todos los detalles de la película con la API
      this.movie = movie;

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

  getUser(uid) {
    this.subscription = this.userService.getUser(uid).subscribe(data => this.user = data);
  }

  // Recuper películas vistas
  async getSeenMovies() {
    const movies  = Promise.all(this.user.seen.map(m => {
      return this.moviesService.getMovieById(m.movie).pipe(first()).toPromise();
    }));
    return movies;
  }

  // Recupera películas guardadas
  async getSavedMovies() {
    const movies = Promise.all(this.user.saved.map(m => {
      return this.moviesService.getMovieById(m.movie).pipe(first()).toPromise();
    }));
    return movies;
  }
  // async ngOnInit() {

  //   const state = await this.authService.isLogged();

  //   if(state == null){
  //     console.timeLog('no session');
  //     this.presentModal();
  //   } else {
  //     try {
  //       const loading = await this.loadinController.create({
  //         message: 'Loading',
  //         translucent: true
  //       });

  //       await loading.present();

  //       await this.getUserData();

  //       loading.dismiss();
        
  //     } catch (error) {
  //       console.log('Some error ocurred');
  //     }
      
  //   }
  // }

  // async getModal(movie) {

  //   const images = await this.moviesService.getMovieImages(movie.id).pipe().toPromise();
    
  //   const modal = await this.modalController.create({
  //     component: ModalMovieDetailsComponent,
  //     componentProps: {
  //       movie: movie,
  //       images: images
  //     }
  //   });
  //   return await modal.present();
  // }

  // async getUserData() {
  //   const uid = await this.authService.getUserId();
  //   this.subscribe = this.userService.getUser(uid).subscribe(data => this.user = data);
  //   console.log(this.user);
  // }

  // async presentModal(){
  //   const modal = await this.modalController.create({
  //     component: LoginSignupModalComponent
  //   });

  //   return await modal.present();
  // }

  // logout(){
  //   this.authService.logout();
  //   this.presentToast('Session ended');
  // }

  // async presentToast(message) {
  //   const toast = await this.toastController.create({
  //     message: message,
  //     duration: 5000
  //   });
  //   toast.present();
  // }

  // async isLogged() {
  //   console.log('boton clickado');
  //   const state = await this.authService.isLogged();
  //   if(state){
  //     this.presentToast('User logged');
  //   } else {
  //     this.presentToast('User not logged in the app');
  //   }
  // }

  // async segmentChanged(event) {
  //   if(event.detail.value === 'collections') {
  //     this.lists = await this.listsService.getDetailedLists(this.user.id);
  //     this.selector = event.detail.value;
  //   } else {
  //     this.selector = event.detail.value;
  //   }
    
  // }

  // getDetails(list) {
  //   this.router.navigate(['tabs/profile/lists/details'], {state: list})
  // }

}
