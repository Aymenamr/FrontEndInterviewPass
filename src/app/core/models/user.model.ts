import { Skill } from "./skill.model";

export interface RegisterPayload {
  UserType: number;
  Name: string;
  login: string;
  Password: string;
  Phone: string;
  LevelOfExperience: number | null;
  Skills: { id: string }[];
  Company: string | null;
}


export interface FormValue {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  experience: number | null;
  fieldId: string | null;
  skillIds: Skill[];
  company: string;
}
