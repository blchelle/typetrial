export const emailValidator = (email: string) => {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
};

export const passwordValidator = (password: string) => {
  const passwordRegex = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/;
  return passwordRegex.test(password);
};

export const blankValidator = (text: string) => text.length > 0;
