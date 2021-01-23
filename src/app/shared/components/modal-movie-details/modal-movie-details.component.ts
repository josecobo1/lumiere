import { Component, Input, OnInit } from '@angular/core';
import { ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { first } from 'rxjs/operators';
import { Movie } from 'src/app/core/model/movies/movie';
import { AuthService } from 'src/app/core/services/auth.service';
import { ListsService } from 'src/app/core/services/lists.service';
import { UserService } from 'src/app/core/services/user.service';
import { LoginSignupModalComponent } from '../login-signup-modal/login-signup-modal.component';
import { ModalNewListComponent } from '../modal-new-list/modal-new-list.component';

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
              public listsService: ListsService) { }

  @Input() movie: Movie;
  @Input() images: any;
  @Input() platforms: any;

  seen: boolean;
  saved: boolean;

  // Lista de fake para el action sheet
  lists = [
    {
      name: 'Terminator',
      id: 1
    },
    {
      name: 'Spain is different',
      id: 2
    },
    {
      name: 'Goya 2020',
      id: 3
    }
  ];
  
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
  saveIntoList(movieId){
    alert(movieId);
  }

  // Transforma una lista de objetos clave valor en opciones para el ActionSheetOptions
  transformListObjectIntoActionSheetParameters(lists: any) {

    console.log('array de entrada', lists);
    console.log(`El array de entrada es mayor que 0: ${lists.length != 0}`)

    const options = [];
    console.log('antes del map');
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

    console.log(options);
    return options;
    
  }

  // Abre el action sheet del dispositivo y permite al usuario seleccionar una lista para guardar la película 
  // o crear una nueva lista
  async addToList(){
    
    if(await this.isUserLogged()){

      // Recupero el uid del usuario
      const userUid = await this.auth.getUserId();

      // Recupero las listas de un usuario
      const lists = await this.listsService.getUserLists(userUid);

      // Para cada lista que tiene el usuario recupero los dealles de cada una
      // id, nombre y array de peliculas
      let listsDetails = await Promise.all(lists.map(async (l) => {
        return await this.listsService.getListDetails(l).pipe(first()).toPromise();
      }));

      // Paso la lista con los detalles de cada lista a la función transform que me devuelve
      // un array con las opciones para el actionsheet
      const options = this.transformListObjectIntoActionSheetParameters(listsDetails);

      const actionSheet = await this.actionSheetController.create({
        buttons: [
          ...options
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
    const logged = await this.isUserLogged();
    if(logged) {
      this.isSeen();
      this.isSaved();
    }
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

  async newMoviesList() {
    const modal = await this.modalController.create({
      component: ModalNewListComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log('nueva lista:', data);
    this.lists.push(data.list);
    
  }

}
