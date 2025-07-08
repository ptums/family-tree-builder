export interface SlimMember {
  name: string;
  id: string;
}
[];

export interface ParentsSlim {
  father?: SlimMember | null;
  mother?: SlimMember | null;
}
