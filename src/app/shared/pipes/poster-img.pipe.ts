import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'posterImg'
})
export class PosterImgPipe implements PipeTransform {

  transform(poster_path: string): string {
    if(poster_path) {
      return 'https://image.tmdb.org/t/p/w400' + poster_path;
    }
    else {
      return 'https://via.placeholder.com/400x560';
    }
    
  }

}
