-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2024 at 05:18 AM
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
(1, 'Harvesting coconuts', '[800, 801, 804, 500]', 'Harvest during the dry season when fruits are ripe. Avoid harvesting during heavy rain.', 25, 32, 60, 90, 15, 20, 100, 1000, 1030),
(2, 'Cleaning coconut trees', '[800, 801, 804, 500]', 'Clean around trees by removing fallen leaves and debris to prevent pest infestation.', 25, 30, 50, 85, 12, 15, 100, 1000, 1030),
(3, 'Applying fertilizer', '[800, 801]', 'Apply organic or chemical fertilizer around the base of the tree during dry weather.', 26, 30, 60, 80, 10, 15, 80, 1000, 1030),
(4, 'Watering coconut plants', '[800, 801, 804]', 'Water trees during dry spells to maintain soil moisture and prevent stress.', 25, 30, 50, 85, 12, 15, 100, 1000, 1030),
(5, 'Inspecting for pests', '[800, 801, 804]', 'Regular inspection of trees for pests such as beetles and mites is essential.', 24, 30, 50, 85, 15, 20, 100, 1000, 1030),
(6, 'Transplanting coconut seedlings', '[800, 801, 802, 804]', 'Best to transplant during early morning or late afternoon with moderate weather.', 25, 32, 60, 85, 15, 20, 100, 1000, 1030),
(7, 'Pruning coconut palms', '[800, 801, 804]', 'Remove dead or diseased leaves to encourage growth and prevent pest buildup.', 24, 30, 50, 85, 12, 15, 100, 1000, 1030),
(8, 'Mulching around coconut trees', '[800, 801, 804]', 'Spread organic mulch around the base of the tree to conserve moisture.', 25, 30, 60, 90, 10, 15, 100, 1000, 1030),
(9, 'Monitoring soil health', '[800, 801, 804]', 'Check soil pH and moisture content regularly for optimal tree health.', 24, 30, 50, 85, 12, 15, 100, 1000, 1030),
(10, 'Controlling weeds', '[800, 801, 804]', 'Remove weeds manually or use herbicides to prevent competition for nutrients.', 25, 30, 50, 85, 12, 15, 100, 1000, 1030),
(11, 'Harvesting coconut sap (tuba)', '[800, 801, 802, 500]', 'Best done early in the morning or evening to ensure fresh sap collection.', 22, 30, 60, 90, 15, 20, 100, 980, 1010),
(12, 'Managing irrigation', '[800, 801, 804]', 'Ensure trees receive adequate water supply during dry spells through irrigation.', 24, 32, 60, 90, 10, 15, 100, 1000, 1030),
(13, 'Monitoring growth', '[800, 801, 804]', 'Regularly check tree growth and health indicators to ensure optimal development.', 24, 30, 50, 85, 12, 15, 100, 1000, 1030),
(14, 'Preparing for typhoon', '[800, 502, 900]', 'Secure trees and surrounding areas to minimize damage during typhoons.', 22, 30, 60, 90, 50, 60, 100, 980, 1010);

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
