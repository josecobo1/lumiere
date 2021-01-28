import { MoviesService } from 'src/app/core/services/movies.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { BehaviorSubject, from, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
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

  // REFACTOR

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

  seen;
  saved;
  // user;
  lists;
  subscribe: Subscription;

  selector: string = 'seen';
  // collections;
  private userData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(public modalController: ModalController, 
              public authService: AuthService, 
              public toastController: ToastController,
              public userService: UserService,
              public listsService: ListsService,
              public router: Router,
              public loadinController: LoadingController,
              public moviesService: MoviesService) { }

  async ngOnInit() {

    const loading = await this.loadinController.create({
      message: 'Loading...',
      translucent: true
    });

    await loading.present();

    try {
      // Verifico si hay sesión
      this.isLogged = await this.authService.isLogged();

      if(this.isLogged) {
        const uid = await this.authService.getUserId();
        await this.getUserData(); // Recupero toda a información del usuario
        this.seen = await this.getMovies(this.user.seen);
        this.saved = await this.getMovies(this.user.saved);
        console.log(this.saved);
      } else {
        this.presentModal();
      }
    } catch (error) {
      
    } finally {
      loading.dismiss();
    }
  }

  async getMovies(list) {
    console.log(list);
    const movies = await Promise.all(list.map(async s => {
      return await this.moviesService.getMovieById(s.movie).pipe().toPromise();
    }));
    return movies;
  }

  async getModal(movie) {

    const images = await this.moviesService.getMovieImages(movie.id).pipe().toPromise();
    
    const modal = await this.modalController.create({
      component: ModalMovieDetailsComponent,
      componentProps: {
        movie: movie,
        images: images
      }
    });
    return await modal.present();
  }

  async getUserData() {
    const uid = await this.authService.getUserId();
    this.user = await this.userService.getUser(uid).pipe(first()).toPromise();
    console.log(this.user);
  }

  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent
    });

    await modal.present();

    modal.onWillDismiss().then(data => {
      // Refresco la info del usuario y las peliculas vistas, guardadas y colecciones
      this.ngOnInit();
    });
  }

  logout(){
    this.authService.logout();
    this.presentToast('Session ended');
  }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000
    });
    toast.present();
  }

  // async isLogged() {
  //   console.log('boton clickado');
  //   const state = await this.authService.isLogged();
  //   if(state){
  //     this.presentToast('User logged');
  //   } else {
  //     this.presentToast('User not logged in the app');
  //   }
  // }

  async segmentChanged(event) {
    if(event.detail.value === 'collections') {
      this.lists = await this.listsService.getDetailedLists(this.user.id);
      this.selector = event.detail.value;
    } else {
      this.selector = event.detail.value;
    }
    
  }

  // getDetails(list) {
  //   this.router.navigate(['tabs/profile/lists/details'], {state: list})
  // }

  async getDetails(movie) {

    console.log(movie);

    // Muestra el spinner de carga
    const loading = await this.loadinController.create({
      message: 'Loading...',
      translucent: true
    });

    loading.present();

    try {

      this.movie = movie;

      // Comprueva si el usuario ha vista la película
      this.isSeen = this.user.seen.some(s => s.movie == movie.id);

      // Comprueva si el usuario ha guardado la película
      this.isSaved = this.user.saved.some(s => s.movie == movie.id);

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
      
    } finally {
      loading.dismiss();
    }

    this.presentDetails();

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
      // Refresco la info del usuario y las peliculas vistas, guardadas y colecciones
      this.ngOnInit();
    });
  }

}
