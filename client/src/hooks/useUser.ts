const useUser = () => {
  const localStorageUser = localStorage.getItem('user');
  const user = localStorageUser ? JSON.parse(localStorageUser) : null;

  return user;
};

export default useUser;
