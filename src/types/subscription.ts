import { PaginationLink } from "./apartment"

 

export type TransactionInterface = {}

export type PlansInterface = {
  'id':number,
    'name': any,
    'slug': string,
    'description': any | null,
    'is_active': boolean | null,
    'price': number | null,
    'signup_fee': number | null,
    'currency': string,
    'trial_period': number | null,
    'trial_interval': string | null,
    'invoice_period': number | null,
    'invoice_interval': string | null,
    'grace_period': number | null,
    'grace_interval': string | null,
    'prorate_day': number | null,
    'prorate_period': number | null,
    'prorate_extend_due': number | null,
    'active_subscribers_limit': number | null,
    'sort_order': number | null
}


  export interface ApiSubscriptionResponse {
    success: boolean;
    message: string;
    data: {
      current_page: number;
      data: SubscriptionInterface[]|[]|null|undefined;
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

export type SubscriptionInterface = {
    'id':number,
    'subscriber_type': string,
    'subscriber_id': number,
    'name': any,
    'slug': string,
    'description': string,
    'timezone': string,
    'trial_ends_at': Date | null,
    'starts_at': Date | null,
    'ends_at': Date | null,
    'cancels_at': Date | null,
    'canceled_at': Date | null
    'plan': PlansInterface
}