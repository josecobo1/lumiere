import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Movie } from 'src/app/core/model/movies/movie';
import { AuthService } from 'src/app/core/services/auth.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from '../login-signup-modal/login-signup-modal.component';
import { v4 as uuidv4 } from 'uuid';
import { MoviesService } from 'src/app/core/services/movies.service';
import { GeolocationService } from 'src/app/core/services/geolocation.service';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-movie-details',
  templateUrl: './modal-movie-details.component.html',
  styleUrls: ['./modal-movie-details.component.scss'],
})
export class ModalMovieDetailsComponent implements OnInit {

  constructor(public modalController: ModalController, 
              public auth: AuthService, 
              public userService: UserService,
              public actionSheetController: ActionSheetController,
              public toast: ToastController,
              public listsService: ListsService,
              public alertController: AlertController,
              public loadingController: LoadingController,
              public moviesService: MoviesService,
              public geolocationService: GeolocationService) { }

  @Input() movie: Movie;
  //@Input() images: any;
  //@Input() region: any;

  seen: boolean;
  saved: boolean;
  images: any;
  platforms: any;
  region: any;
  movieObject: any;
  cast: any;

  async getCast() {
    this.cast = await this.moviesService.getCast(this.movie.id).pipe().toPromise();
  }

  // Recupera los detalles de la película
  async getMovieDetails() {
    this.movieObject = await this.moviesService.getMovieById(this.movie.id).pipe().toPromise();
    console.log('movieObject', this.movieObject);
  }

  // Recupero la ubicación del usuario
  async getLocation(){
    this.region = await this.geolocationService.getCurrentLocation();
  }

  // Recupera todas las imagenes de una película
  async getMovieImages(){
    this.images = await this.moviesService.getMovieImages(this.movieObject.id).pipe().toPromise();
  }

  // Recupera las plaaformas sónde ver una película
  async getPlatforms() {
    this.platforms = await this.moviesService.whereToWatch(this.movieObject.id).pipe().toPromise();
    this.platforms = this.platforms.results[this.region];
  }

 // Comprueva si el usuario ha iniciado sesión, en caso contrario muestra el modal para iniciar sesión
  async isUserLogged(){
    const state = await this.auth.isLogged();

    if(state == null) {
      return false;
    } else {
      return true;
    }
    
  }

  // Abre el modal para iniciar sesión
  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent,
    });

    return await modal.present();
  }

  // Guarda en la bbdd una película como vista
  async setAsSeen(){

    // Si el usuario ha inicido sesión guardamos la película como vista, en caso contrario la función isLogged 
    // mostrará el modal de inicio de sesión
    if(await this.isUserLogged()){

      // Recupero el uid del usuario de la base de datos
      const userUid = await this.auth.getUserId(); 

      try {

        // Uso uid el usuario e id de la película para añadir la pelilcula a vistas
        // si la película no està marcada como vista el service devuelve true, en caso contrario
        // devuelve false
        const result = await this.userService.addMovieToSeen(userUid, this.movie.id);

        if(result){
          // Toast de confirmación
        this.presentToast('Movie saved as seen');
        await this.isSeen();
        } else {
          await this.userService.removeMovieFromSeen(userUid, this.movie.id);
          this.presentToast('Movie removed as seen');
          await this.isSeen();
        }

      } catch (error) {
        this.presentToast('Oops something has failed please try again later');
      }
      
    } else  {
      this.presentModal();
    }
     
  }

  // Guarda en la bbdd una película com pendiente de ver
  async setAsToSee(){

    if(await this.isUserLogged()) {

      // Recupero el uid del usuario de la base de datos
      const userUid = await this.auth.getUserId();

      try { 

        // Uso uid el usuario e id de la película para añadir la pelilcula a vistas
        const result = await this.userService.addMovieToSeeLater(userUid, this.movie.id);

        if(result) {
          // Muestro Toast de confirmación
          this.presentToast('Movie saved to save later');
          await this.isSaved();
        } else {
          await this.userService.removeMovieFromSeeLater(userUid, this.movie.id);
          this.presentToast('The movie has been removed from saved');
          await this.isSaved();
        }

      } catch (error) {
        this.presentToast('Ooops something failed please try again later');

      }
      
    } else {
      this.presentModal();
    }
    
  }

  // Guarda una película dentro de una lista
  async saveIntoList(listId){
    const result = await this.listsService.addMovieToList(this.movie.id, listId);
    if(result) {
      this.presentToast('Movie added to your list');
    } else {
      this.presentToast('This movie is already on your list');
    }
  }

  // Transforma una lista de objetos clave valor en opciones para el ActionSheetOptions
  transformListObjectIntoActionSheetParameters(lists: any) {

    const options = [];

    lists.map(l => {
      const opt = {
        text: l.name,
        handler: () => {
          this.saveIntoList(l.id)
        }
      }
      console.log(opt);
      options.push(opt);
    });

    return options;
    
  }

  // Abre el action sheet del dispositivo y permite al usuario seleccionar una lista para guardar la película 
  // o crear una nueva lista
  async addToList(){
    
    if(await this.isUserLogged()){

      // Recupero el uid del usuario
      const userUid = await this.auth.getUserId();

      // Recupero las listas del usuario
      // const lists = await this.listsService.getDetailedLists(userUid);
      const lists = await this.listsService.getUserOwnedLists(userUid).pipe(first()).toPromise();

      // Paso la lista con los detalles de cada lista a la función transform que me devuelve
      // un array con las opciones para el actionsheet
      const options = this.transformListObjectIntoActionSheetParameters(lists);

      const actionSheet = await this.actionSheetController.create({
        buttons: [
          {
            text: 'New list',
            handler: () => {
              this.presentAlert();
            }
          },
          ...options,{
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      });

      actionSheet.present();

    } else {
      this.presentModal();
    }

    
  }

  // Opciones para el slide de imagenes
  slideOpts = {
    initialSlide: 1,
    speed: 400,
    autoplay: {
      delay: 3000
    }
  }

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: 'Loading',
      translucent: true
    });

    await loading.present();

    const logged = await this.isUserLogged();
    if(logged) {
      this.isSeen();
      this.isSaved();
    }

    await this.getMovieDetails();
    await this.getLocation();
    await this.getMovieImages();
    await this.getPlatforms();
    await this.getCast();

    
    loading.dismiss();

    console.log(this.platforms);
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  async presentToast(message) {
    const toast = await this.toast.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  async isSeen(){
    const userUid = await this.auth.getUserId();
    this.seen = await this.userService.isSeen(userUid, this.movie.id);
    console.log('seen', this.saved);
  }

  async isSaved() {
    const userUid = await this.auth.getUserId();
    this.saved = await this.userService.isSaved(userUid, this.movie.id);
    console.log('saved:', this.saved);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'New List',
      inputs: [
        {
          name: 'newList',
          type: 'text',
          placeholder: 'New list'
        }
      ],
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        {
          text: 'Create',
          handler: (data) => {
            this.createNewList(data.newList);
          }
      }
      ]
    });
    await alert.present();
  }

  async createNewList(listName: string){

    const userUid = await this.auth.getUserId();

    const list = {
      id: uuidv4(),
      owner: userUid,
      name: listName,
      movies: [],
      createdAt: moment().format('MMMM Do YYYY, h:mm:ss a'),
      updatedAt: moment().format('MMMM Do YYYY, h:mm:ss a')
    }
    await this.listsService.createNewList(list);
    const result = await this.userService.addListToUser(userUid, list.id);
    if(!result) {
      this.presentToast('Somethign went wrong');
    } else {
      this.saveIntoList(list.id);
    }
  }

}
