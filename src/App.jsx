import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import Search from "./components/Search";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { getTrendingMovies , updateSearchTerm } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [debounseSearchTerm, setDebounseSearchTerm] = useState("");
    const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce( ()=> setDebounseSearchTerm(searchTerm) , 500 , [searchTerm])

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endPoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endPoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch Movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      console.log(data.results);

      if(query && data.results.length > 0){
        await updateSearchTerm(query , data.results[0]) ;
      }


    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error Fetching Movies , Please try later.");
    } finally {
      setIsLoading(false);
    }
  };
  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }
  useEffect(() => {
    fetchMovies(debounseSearchTerm);
  }, [debounseSearchTerm]);

  useEffect(() => {
  loadTrendingMovies();
}, []);
  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="" />
          <h1>
            Find <span className="text-gradient">Movies</span> You ll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
// <section className="all-movies">
{
  /* <h2 className="mt-[40px]">All Movies</h2>

{isLoading ? (
  <Spinner/>
) : errorMessage ? (
  <p className="text-red-500">{errorMessage}</p>
) : (
  <ul>
    {movieList.map((movie)=>(
     <MovieCard key={movie.id} movie={movie}/>
    ))}
  </ul>
)} */
}
