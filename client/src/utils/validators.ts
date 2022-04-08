export const emailValidator = (email: string) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

export const usernameValidator = (username: string) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
  return usernameRegex.test(username);
};

export const passwordValidator = (password: string) => {
  const passwordRegex = /^[a-zA-Z0-9%+'!#$^?:,~_-]{8,32}$/;
  return passwordRegex.test(password);
};

export const blankValidator = (text: string) => text.length > 0;
