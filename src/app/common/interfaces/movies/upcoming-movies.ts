import { Dates } from "./dates";
import { Movie } from "./movie";

export interface UpcomingMovies {
    dates: Dates;
    page: number;
    results: Array<Movie>;
    total_pages: number;
    total_results: number;
}
