import { Account } from "./account";
import { Adress } from "./adress";


export interface Client {
    id: number;
    clientId: number;
    firstName: string;
    lastName: string;
    gender:  'კაცი' | 'ქალი';
    personalNumber: string;
    phoneNumber: string;
    legalAddress:  Adress;
    actualAddress: Adress;
    photo?: string;
    accounts: Account[] | [];
}
