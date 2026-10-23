/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as authHelper from "../authHelper.js";
import type * as bookings from "../bookings.js";
import type * as dealerApplications from "../dealerApplications.js";
import type * as dealers from "../dealers.js";
import type * as enquiries from "../enquiries.js";
import type * as exchangeRates from "../exchangeRates.js";
import type * as favorites from "../favorites.js";
import type * as invoices from "../invoices.js";
import type * as meta from "../meta.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as seed from "../seed.js";
import type * as subscriptionPlans from "../subscriptionPlans.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";
import type * as vehicles from "../vehicles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  authHelper: typeof authHelper;
  bookings: typeof bookings;
  dealerApplications: typeof dealerApplications;
  dealers: typeof dealers;
  enquiries: typeof enquiries;
  exchangeRates: typeof exchangeRates;
  favorites: typeof favorites;
  invoices: typeof invoices;
  meta: typeof meta;
  notifications: typeof notifications;
  orders: typeof orders;
  seed: typeof seed;
  subscriptionPlans: typeof subscriptionPlans;
  subscriptions: typeof subscriptions;
  users: typeof users;
  vehicles: typeof vehicles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
