-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 12, 2024 at 01:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `coconut_users_tasks_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `coconut_tasks`
--

CREATE TABLE `coconut_tasks` (
  `id` int(11) NOT NULL,
  `task` varchar(255) DEFAULT NULL,
  `weatherRestrictions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`weatherRestrictions`)),
  `details` text DEFAULT NULL,
  `requiredTemperature_min` int(11) DEFAULT NULL,
  `requiredTemperature_max` int(11) DEFAULT NULL,
  `idealHumidity_min` int(11) DEFAULT NULL,
  `idealHumidity_max` int(11) DEFAULT NULL,
  `requiredWindSpeed_max` int(11) DEFAULT NULL,
  `requiredWindGust_max` int(11) DEFAULT NULL,
  `requiredCloudCover_max` int(11) DEFAULT NULL,
  `requiredPressure_min` int(11) DEFAULT NULL,
  `requiredPressure_max` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coconut_tasks`
--

INSERT INTO `coconut_tasks` (`id`, `task`, `weatherRestrictions`, `details`, `requiredTemperature_min`, `requiredTemperature_max`, `idealHumidity_min`, `idealHumidity_max`, `requiredWindSpeed_max`, `requiredWindGust_max`, `requiredCloudCover_max`, `requiredPressure_min`, `requiredPressure_max`) VALUES
(1, 'Harvesting coconuts', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}, {\"main\": \"Clouds\", \"description\": \"overcast clouds\"}, {\"main\": \"Rain\", \"description\": \"light rain\"}]', 'Harvest during the dry season when fruits are ripe. Avoid harvesting during heavy rain.', 25, 32, 60, 90, 15, 20, 100, 1010, 1025),
(2, 'Cleaning coconut trees', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Clean around trees by removing fallen leaves and debris to prevent pest infestation.', 25, 30, 50, 75, 10, 15, 100, 1010, 1020),
(3, 'Applying fertilizer', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Apply organic or chemical fertilizer around the base of the tree during dry weather.', 26, 30, 60, 80, 10, 15, 80, 1010, 1020),
(4, 'Watering coconut plants', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Water trees during dry spells to maintain soil moisture and prevent stress.', 25, 30, 50, 75, 10, 15, 100, 1010, 1020),
(5, 'Inspecting for pests', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Regular inspection of trees for pests such as beetles and mites is essential.', 24, 30, 50, 70, 10, 15, 100, 1010, 1025),
(6, 'Transplanting coconut seedlings', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}, {\"main\": \"Clouds\", \"description\": \"scattered clouds\"}]', 'Best to transplant during early morning or late afternoon with moderate weather.', 25, 32, 60, 80, 10, 15, 100, 1010, 1025),
(7, 'Pruning coconut palms', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Remove dead or diseased leaves to encourage growth and prevent pest buildup.', 24, 30, 50, 70, 10, 15, 80, 1010, 1020),
(8, 'Mulching around coconut trees', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Spread organic mulch around the base of the tree to conserve moisture.', 25, 30, 60, 85, 10, 15, 100, 1010, 1020),
(9, 'Monitoring soil health', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Check soil pH and moisture content regularly for optimal tree health.', 24, 30, 50, 70, 10, 15, 100, 1010, 1020),
(10, 'Controlling weeds', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Remove weeds manually or use herbicides to prevent competition for nutrients.', 25, 30, 50, 75, 10, 15, 100, 1010, 1020),
(11, 'Harvesting coconut sap (tuba)', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}, {\"main\": \"Clouds\", \"description\": \"scattered clouds\"}, {\"main\": \"Rain\", \"description\": \"light rain\"}]', 'Best done early in the morning or evening to ensure fresh sap collection.', 22, 30, 60, 90, 10, 15, 100, 1010, 1020),
(12, 'Managing irrigation', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Ensure trees receive adequate water supply during dry spells through irrigation.', 24, 32, 60, 80, 10, 15, 100, 1010, 1020),
(13, 'Monitoring for diseases', '[{\"main\": \"Clear\", \"description\": \"Clear sky\"}, {\"main\": \"Clouds\", \"description\": \"Few clouds\"}]', 'Regular monitoring of trees for diseases such as bud rot or leaf blight is crucial.', 24, 30, 50, 70, 10, 15, 100, 1010, 1025),
(14, 'Preparing for typhoons', '[{\"main\": \"Clouds\", \"description\": \"overcast clouds\"}, {\"main\": \"Rain\", \"description\": \"moderate rain\"}, {\"main\": \"Rain\", \"description\": \"heavy rain\"}]', 'Secure trees, harvest any mature coconuts, and reinforce tree structures before storms.', 22, 30, 70, 90, 20, 25, 100, 1005, 1020);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `coconut_tasks`
--
ALTER TABLE `coconut_tasks`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
