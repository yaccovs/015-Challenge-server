CREATE TABLE `jobs` (
  `name` varchar(255) NOT NULL,
  `job` varchar(255) NOT NULL,
  `salary` int(11) NOT NULL,
  PRIMARY KEY (`name`)
);

LOAD DATA LOCAL INFILE './data.csv' INTO TABLE jobs FIELDS TERMINATED BY ',';