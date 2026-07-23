import { createDocument } from "zod-openapi";

import {
  createMovieBody,
  getMoviesQuery,
  movieIdParams,
  updateMovieBody,
} from "../validations/movie.validation.ts";

import {
  addToWatchlistBody,
  updateWatchlistItemBodyBase,
  watchlistItemIdParams,
  getWatchlistQuery,
} from "../validations/watchlist.validation.ts";

import {
  loginBody,
  registerBody,
  registerResponse,
  loginResponse,
  logoutResponse,
  errorResponse,
} from "../validations/user.validation.ts";

export const openApiDocument = createDocument({
  openapi: "3.1.0",
  info: { title: "Movie Watchlist API", version: "1.0.0" },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        tags: ["Auth"],
        requestBody: {
          content: { "application/json": { schema: registerBody } },
        },
        responses: {
          201: {
            description: "User created — sets JWT httpOnly cookie",
            content: { "application/json": { schema: registerResponse } },
          },
          400: {
            description: "User already exists with this email",
            content: { "application/json": { schema: errorResponse } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Log in",
        tags: ["Auth"],
        requestBody: {
          content: { "application/json": { schema: loginBody } },
        },
        responses: {
          200: {
            description: "Logged in — sets JWT httpOnly cookie",
            content: { "application/json": { schema: loginResponse } },
          },
          401: {
            description: "Invalid email or password",
            content: { "application/json": { schema: errorResponse } },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Log out",
        tags: ["Auth"],
        description: "Clears the JWT httpOnly cookie",
        responses: {
          200: {
            description: "Logged out successfully",
            content: { "application/json": { schema: logoutResponse } },
          },
        },
      },
    },

    "/movies": {
      get: {
        summary: "List movies",
        tags: ["Movies"],
        requestParams: { query: getMoviesQuery },
        responses: {
          200: { description: "Paginated list of movies" },
        },
      },
      post: {
        summary: "Create a movie",
        tags: ["Movies"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: createMovieBody } },
        },
        responses: {
          201: { description: "Movie created" },
          401: { description: "Not authorized" },
        },
      },
    },
    "/movies/{id}": {
      get: {
        summary: "Get a movie by ID",
        tags: ["Movies"],
        requestParams: { path: movieIdParams },
        responses: {
          200: { description: "Movie found" },
          404: { description: "Movie not found" },
        },
      },
      patch: {
        summary: "Update a movie",
        tags: ["Movies"],
        security: [{ cookieAuth: [] }],
        requestParams: { path: movieIdParams },
        requestBody: {
          content: { "application/json": { schema: updateMovieBody } },
        },
        responses: {
          200: { description: "Movie updated" },
          404: { description: "Movie not found" },
        },
      },
      delete: {
        summary: "Delete a movie",
        tags: ["Movies"],
        security: [{ cookieAuth: [] }],
        requestParams: { path: movieIdParams },
        responses: {
          204: { description: "Movie deleted" },
          404: { description: "Movie not found" },
        },
      },
    },

    "/watchlist": {
      get: {
        summary: "Get current user's watchlist",
        tags: ["Watchlist"],
        security: [{ cookieAuth: [] }],
        requestParams: { query: getWatchlistQuery },
        responses: {
          200: { description: "Paginated watchlist items" },
          401: { description: "Not authorized" },
        },
      },
      post: {
        summary: "Add a movie to the watchlist",
        tags: ["Watchlist"],
        security: [{ cookieAuth: [] }],
        requestBody: {
          content: { "application/json": { schema: addToWatchlistBody } },
        },
        responses: {
          201: { description: "Item added" },
          401: { description: "Not authorized" },
          404: { description: "Movie not found" },
          409: { description: "Movie already in watchlist" },
        },
      },
    },

    "/watchlist/{id}": {
      get: {
        summary: "Get a single watchlist item",
        tags: ["Watchlist"],
        security: [{ cookieAuth: [] }],
        requestParams: { path: watchlistItemIdParams },
        responses: {
          200: { description: "Item found" },
          401: { description: "Not authorized" },
          403: { description: "Not allowed to access this item" },
          404: { description: "Item not found" },
        },
      },
      patch: {
        summary: "Update a watchlist item",
        tags: ["Watchlist"],
        security: [{ cookieAuth: [] }],
        requestParams: { path: watchlistItemIdParams },
        requestBody: {
          content: {
            "application/json": { schema: updateWatchlistItemBodyBase },
          },
        },
        responses: {
          200: { description: "Item updated" },
          400: { description: "At least one field must be provided" },
          401: { description: "Not authorized" },
          403: { description: "Not allowed to access this item" },
          404: { description: "Item not found" },
        },
      },
      delete: {
        summary: "Remove an item from the watchlist",
        tags: ["Watchlist"],
        security: [{ cookieAuth: [] }],
        requestParams: { path: watchlistItemIdParams },
        responses: {
          204: { description: "Item removed" },
          401: { description: "Not authorized" },
          403: { description: "Not allowed to access this item" },
          404: { description: "Item not found" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "jwt" },
    },
  },
});
