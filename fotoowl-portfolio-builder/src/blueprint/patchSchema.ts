/**
 * Zod schemas for Blueprint patches.
 * Patches target stable node IDs — never rely on array index alone.
 */
import { z } from 'zod';
import { blueprintNodeSchema } from './schema';

const nodeChangesSchema = z
  .object({
    type: z
      .enum([
        'section',
        'container',
        'heading',
        'text',
        'image',
        'video',
        'button',
        'component',
      ])
      .optional(),
    component: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
    layout: z.record(z.string(), z.unknown()).optional(),
    styles: z.record(z.string(), z.unknown()).optional(),
    animation: z.record(z.string(), z.unknown()).optional(),
    responsive: z.record(z.string(), z.unknown()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const blueprintPatchSchema = z.discriminatedUnion('op', [
  z
    .object({
      op: z.literal('add'),
      /** null = root sections list */
      parentId: z.string().nullable(),
      /** Insert index; defaults to append */
      index: z.number().int().min(0).optional(),
      node: blueprintNodeSchema,
    })
    .strict(),
  z
    .object({
      op: z.literal('update'),
      targetId: z.string().min(1),
      changes: nodeChangesSchema,
    })
    .strict(),
  z
    .object({
      op: z.literal('delete'),
      targetId: z.string().min(1),
    })
    .strict(),
  z
    .object({
      op: z.literal('move'),
      targetId: z.string().min(1),
      parentId: z.string().nullable(),
      index: z.number().int().min(0),
    })
    .strict(),
  z
    .object({
      op: z.literal('reorder'),
      parentId: z.string().nullable(),
      /** Full ordered list of sibling IDs under parentId */
      orderedIds: z.array(z.string().min(1)).min(1),
    })
    .strict(),
  z
    .object({
      op: z.literal('replace'),
      targetId: z.string().min(1),
      /** Replacement node; id should usually match targetId */
      node: blueprintNodeSchema,
    })
    .strict(),
]);

export type BlueprintPatchInput = z.infer<typeof blueprintPatchSchema>;
