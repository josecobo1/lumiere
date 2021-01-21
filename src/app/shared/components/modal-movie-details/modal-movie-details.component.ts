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
  seen: boolean;
  saved: boolean;

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

  async presentModal(){
    const modal = await this.modalController.create({
      component: LoginSignupModalComponent,
    });

    return await modal.present();
  }

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
          this.presentToast('This movie was already saved as seen');
          await this.isSeen();
        }

      } catch (error) {
        this.presentToast('Oops something has failed please try again later');
      }
      
    } else  {
      this.presentModal();
    }
     
  }

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

  saveIntoList(movieId){
    alert(movieId);
  }

  // Transforma una lista de objetos clave valor en opciones para el ActionSheetOptions
  transformListObjectIntoActionSheetParameters(lists: any) {

    console.log(lists);

    let options = [];

    // lists.map(l => {
    //   console.log(l);
    //   const opt = {
    //     text: l.name,
    //     handler: () => {
    //       this.saveIntoList(l.id)
    //     }
    //   };
    //   options.push(opt);
    // })
    console.log('antes del bucle dentro del transform');
    lists.forEach(element => {
      console.log(element);
      const opt = {
        text: element.name,
        handler: () => {
          this.saveIntoList(element.id)
        }
      };
      options.push(opt);
    });

    console.log(options);

    return options;
  }

  async addToList(){
    
    if(await this.isUserLogged()){

      // Recupero el uid del usuario
      const userUid = await this.auth.getUserId();

      // Recupero las listas de un usuario
      const lists = await this.listsService.getUsersLists(userUid);
      console.log(lists);
      let sheetOptions = this.transformListObjectIntoActionSheetParameters(lists);

      // array con objetos sheetOptions
      let actionSheetOptions = [
          {
            text: 'New list',
            handler: () => {
              this.newMoviesList();
            }
          },
          ...sheetOptions
      ];

      console.log('options', sheetOptions);
      
      // Configuro sheetOptions
      const actionSheet = await this.actionSheetController.create({
        buttons: [
          ...actionSheetOptions
        ]
      });
      await actionSheet.present();
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
