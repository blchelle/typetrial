import {
  adjectives, animals, NumberDictionary, uniqueNamesGenerator,
} from 'unique-names-generator';

const useUser = () => {
  const localStorageUser = localStorage.getItem('user');
  if (localStorageUser) {
    return JSON.parse(localStorageUser);
  }

  // Store temporary guest information in local storage
  // 1400 adjectives * 350 animals * 100 numbers = 49,000,000 unique names
  const numbers = NumberDictionary.generate({ min: 0, max: 99 });
  const guestName = uniqueNamesGenerator({ dictionaries: [adjectives, animals, numbers] });
  const user = { username: guestName };
  localStorage.setItem('user', JSON.stringify(user));

  return user;
};

export default useUser;
