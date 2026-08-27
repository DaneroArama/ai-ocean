/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as buildathonRegistrations from "../buildathonRegistrations.js";
import type * as buildathonRoles from "../buildathonRoles.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as participants from "../participants.js";
import type * as personalityTest from "../personalityTest.js";
import type * as registrations from "../registrations.js";
import type * as roleDiscoveryAnswers from "../roleDiscoveryAnswers.js";
import type * as roleDiscoveryQuestions from "../roleDiscoveryQuestions.js";
import type * as seedBuildathon from "../seedBuildathon.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  buildathonRegistrations: typeof buildathonRegistrations;
  buildathonRoles: typeof buildathonRoles;
  helpers: typeof helpers;
  http: typeof http;
  participants: typeof participants;
  personalityTest: typeof personalityTest;
  registrations: typeof registrations;
  roleDiscoveryAnswers: typeof roleDiscoveryAnswers;
  roleDiscoveryQuestions: typeof roleDiscoveryQuestions;
  seedBuildathon: typeof seedBuildathon;
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
