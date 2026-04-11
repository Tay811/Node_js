CREATE TABLE "shipments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_warehouse" text NOT NULL,
	"ingredient_id" text NOT NULL,
	"units" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
