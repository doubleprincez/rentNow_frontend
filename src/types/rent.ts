import { Apartment, PaginationLink } from "./apartment";

export interface RentInterface{
    id:number,
    tenant_id:number,
    apartment_id:number,
    amount:number,
    currency_code:string|null,
    proof_of_payment?:File|null,
    start?:Date|string|null,
    end?: Date|string|null,
    metadata: any,
    approved?:boolean,
    created_at:Date|string,
    updated_at:Date|string
    apartment?:Apartment
    
    } 
    
    
    export interface ApiRentResponse {
         success: boolean;
            message: string;
            data: {
              current_page: number;
              data: any;
              first_page_url: string;
              from: number;
              last_page: number;
              last_page_url: string;
              links: PaginationLink[];
              next_page_url: string | null;
              path: string;
              per_page: number;
              prev_page_url: string | null;
              to: number;
              total: number;
            };
    }