import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'posterImg'
})
export class PosterImgPipe implements PipeTransform {

  transform(poster_path: string): string {
    return 'http://image.tmdb.org/t/p/w400/' + poster_path;
  }

}
