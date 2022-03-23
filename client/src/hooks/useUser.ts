import { v4 as uuid } from 'uuid';

const useUser = () => {
  const localStorageUser = localStorage.getItem('user');
  if (localStorageUser) {
    return localStorage;
  }

  const user = {username: uuid()};

  localStorage.setItem('user', JSON.stringify(user));
  
  return user;
};

export default useUser;
