import { handlers } from "@/lib/auth";

// Re-export concrete handlers so Next.js sees proper function signatures
export const GET = handlers.GET;
export const POST = handlers.POST;
