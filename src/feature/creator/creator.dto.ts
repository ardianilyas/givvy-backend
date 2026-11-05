import z from "zod";

export const createCreatorDto = z.object({
  username: z.string({ error: "username is required" }).min(5),
  displayName: z.string({ error: "display name is required" }).min(5),
  description: z.string({ error: "description is required" }).min(5),
});
export const updateCreatorDto = createCreatorDto.partial();
export const getCreatorById = z.uuid();
export const getCreatorByUsername = z.string();

export type CreateCreatorDto = z.infer<typeof createCreatorDto>;
export type UpdateCreatorDto = z.infer<typeof updateCreatorDto>;
