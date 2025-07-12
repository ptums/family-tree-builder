export interface SlimMember {
  name: string;
  id: string;
  gender: string;
}
[];

export interface ParentsSlim {
  father?: SlimMember | null;
  mother?: SlimMember | null;
}
