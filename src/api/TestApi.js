import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const fetchPokemon = async (pokemonName = null) => {
  try {
    let url;
    if (pokemonName) {
      url = `${BASE_URL}/pokemon/${pokemonName.toLowerCase()}`;
    } else {
      // Fetch total count of Pokemon
      const countResponse = await axios.get(`${BASE_URL}/pokemon?limit=1`);
      const totalPokemon = countResponse.data.count;
      
      // Generate random number between 1 and total count
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
      url = `${BASE_URL}/pokemon/${randomId}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar Pokémon:', error);
    // Se der erro, tenta buscar um Pokémon aleatório
    if (pokemonName) {
      return fetchPokemon();
    }
    throw error;
  }
};

export default api;
