CREATE TABLE `__new_invoice_products_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`category` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`brand` varchar(255) NOT NULL,
	`origin` varchar(255),
	`weight` varchar(255),
	`perBox` int,
	`quantity` int NOT NULL,
	`rate` int NOT NULL,
	`amount` int NOT NULL,
	CONSTRAINT `invoice_products_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_invoice_products_table`(`id`, `category`, `description`, `brand`, `origin`, `weight`, `perBox`, `quantity`, `rate`, `amount`) SELECT `id`, `category`, `description`, `brand`, `origin`, `weight`, `perBox`, `quantity`, `rate`, `amount` FROM `invoice_products_table`;--> statement-breakpoint
DROP TABLE `invoice_products_table`;--> statement-breakpoint
ALTER TABLE `__new_invoice_products_table` RENAME TO `invoice_products_table`;