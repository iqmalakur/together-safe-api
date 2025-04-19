export type UserAuthSelection = {
  email: string;
  password: string;
  name: string;
  profilePhoto: string | null;
};

export type UserCreateSelection = {
  email: string;
};
