import type { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.ts";
import AppError from "../utils/AppError.ts";
import { watchlistService } from "../services/watchlist.service.ts";
import type { GetWatchlistQuery } from "../validations/watchlist.validation.ts";

export const addToWatchlist = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authorized.", 401);
    const item = await watchlistService.addToWatchlist(req.user.id, req.body);
    res.status(201).json({ status: "success", data: item });
  },
);

export const getWatchlistItem = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authorized.", 401);

    const { id } = req.params;
    if (typeof id !== "string") {
      throw new AppError("Invalid ID.", 400);
    }

    const item = await watchlistService.getWatchlistItemForUser(
      id,
      req.user.id,
    );
    res.status(200).json({ status: "success", data: item });
  },
);

export const getMyWatchlist = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authorized.", 401);

    const query = req.validated?.query as GetWatchlistQuery;
    const { items, meta } = await watchlistService.getWatchlist(
      req.user.id,
      query,
    );
    res.status(200).json({ status: "success", data: items, meta });
  },
);

export const updateWatchlistItem = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authorized.", 401);

    const { id } = req.params;
    if (typeof id !== "string") {
      throw new AppError("Invalid ID.", 400);
    }

    const item = await watchlistService.updateWatchlistItem(
      id,
      req.user.id,
      req.body,
    );
    res.status(200).json({ status: "success", data: item });
  },
);

export const removeFromWatchlist = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Not authorized.", 401);

    const { id } = req.params;
    if (typeof id !== "string") {
      throw new AppError("Invalid ID.", 400);
    }

    await watchlistService.removeFromWatchlist(id, req.user.id);
    res.status(204).send();
  },
);
