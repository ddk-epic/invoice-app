CREATE TABLE `invoice_products_table` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`category` varchar(255) NOT NULL,
	`description` varchar(255) NOT NULL,
	`brand` varchar(255) NOT NULL,
	`origin` varchar(255),
	`weight` varchar(255),
	`perBox` int,
	`quantity` int NOT NULL,
	`rate` decimal(10,2) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	CONSTRAINT `invoice_products_table_id` PRIMARY KEY(`id`)
);
