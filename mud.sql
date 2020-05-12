-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2020 at 01:57 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mud`
--

-- --------------------------------------------------------

--
-- Table structure for table `characters`
--

CREATE TABLE `characters` (
  `id` int(11) NOT NULL,
  `characters_firstName` varchar(255) NOT NULL DEFAULT 'New First Name',
  `characters_lastName` varchar(255) NOT NULL DEFAULT 'New Last Name',
  `characters_race` int(11) NOT NULL DEFAULT 0,
  `characters_class` int(11) NOT NULL DEFAULT 0,
  `characters_currentRoom` int(255) NOT NULL DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `characters`
--

INSERT INTO `characters` (`id`, `characters_firstName`, `characters_lastName`, `characters_race`, `characters_class`, `characters_currentRoom`) VALUES
(0, 'Default Character', '', 0, 0, 1),
(1, 'Fendryn', 'Telvanni', 1, 1, 1),
(6, 'Jeff', 'Barus', 0, 0, 5),
(7, 'deathwing', 'wing', 1, 0, 8),
(9, 'Banjo', 'Man', 0, 0, 0),
(10, 'deathwing', 'wing', 0, 0, 8),
(11, 'Den', 'Rusty', 0, 0, 8),
(12, 'Snail', 'Mail', 2, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `classes_name` varchar(255) NOT NULL DEFAULT 'New Class',
  `classes_attributeBonuses` varchar(255) NOT NULL DEFAULT '0,0,0,0,0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `classes_name`, `classes_attributeBonuses`) VALUES
(0, 'Fighter', '0,0,0,0,0'),
(1, 'Apprentice', '0,0,0,0,0'),
(2, 'Acolyte', '0,0,0,0,0'),
(3, 'Rogue', '0,0,0,0,0');

-- --------------------------------------------------------

--
-- Table structure for table `races`
--

CREATE TABLE `races` (
  `id` int(11) NOT NULL,
  `races_name` varchar(255) DEFAULT 'New Race',
  `races_attributeBonuses` varchar(255) NOT NULL DEFAULT '0,0,0,0,0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `races`
--

INSERT INTO `races` (`id`, `races_name`, `races_attributeBonuses`) VALUES
(0, 'human', '1,1,1,1,1'),
(1, 'elf', '1,1,1,1,1'),
(2, 'dwarf', '1,1,1,1,1'),
(3, 'hobbit', '1,1,1,1,1');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `rooms_name` varchar(255) NOT NULL DEFAULT 'newRoom',
  `rooms_description` varchar(1024) NOT NULL DEFAULT 'An empty room.',
  `rooms_north` int(11) NOT NULL DEFAULT -1,
  `rooms_east` int(11) DEFAULT -1,
  `rooms_south` int(11) NOT NULL DEFAULT -1,
  `rooms_west` int(11) NOT NULL DEFAULT -1,
  `rooms_playerList` varchar(1024) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `rooms_name`, `rooms_description`, `rooms_north`, `rooms_east`, `rooms_south`, `rooms_west`, `rooms_playerList`) VALUES
(0, 'Cardinal Field', 'You stand in the center of a open field. \r\nTo the north, you see a small cavern \r\nTo the south, you see a path leading into a forest. \r\nTo the east, you see a path leading down to a beach.\r\nTo the west, you see a a gravel path leading to a castle gate.', 1, 3, 5, 7, '12,'),
(1, 'the Eastern Cavern', 'You stand in a small cavern. Water drips from stalagmites and pools in the corner.\r\nYou see light coming from the exit to the south.\r\nThe cavern continues deeper to the west.', -1, -1, 0, 8, '0,1,'),
(2, 'the Northern Beach', 'After walking north along the beach, you come to stand in front of a coconut tree.\r\nThe beach continues to the south.', -1, -1, 3, -1, ''),
(3, 'the Beach', 'You stand on a beach. The water rhythmically crashes over the the sand before returning to the ocean.\r\nThe beach continues to the north.\r\nTo the south, you see the remains of a ship crash.', 2, -1, 4, 0, ''),
(4, 'the Ship Wreck', 'The boat is splintered into many pieces across the sand. You can just make out something shiny in the sand.\r\nThe beach continues to the south.', 3, -1, -1, -1, ''),
(5, 'the Forest', 'You are stand on a path in a sparsely wooded forest.\r\nThrough the trees to the north, you see the path opens up to a field.\r\nTo the east, the path continues deeper into the woods.', 0, -1, -1, 6, '6,'),
(6, 'the Overgrown Forest', 'The narrow path through the trees barely gives you room to maneuver. The path abruptly ends.\r\nThe path to the east seems less overgrown.', -1, 5, -1, -1, ''),
(7, 'the Castle Gate', 'You stand on a gravel pathway before a tall castle gate. The gate prevents you from continuing further to the west. You see a thick forest to the south. You see a rocky outcropping to the north.\r\nThere appears to be a small cave entrance in the rock outcropping to the north.\r\nThe gravel path leads to a field to the east.', 8, 0, -1, -1, ''),
(8, 'the Western Cavern', 'You can hear squeaking coming from the darkness above. Bat droppings cover the cavern floor.\r\nYou see the cavern exit to the south.\r\nThe cavern continues to the east.', -1, 1, 7, -1, '7,11,10,');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `users_username` varchar(255) NOT NULL,
  `users_password` varchar(255) NOT NULL,
  `users_characters` varchar(1024) NOT NULL DEFAULT '-1,-1,-1',
  `users_online` tinyint(1) NOT NULL DEFAULT 0,
  `users_spamTokens` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `users_username`, `users_password`, `users_characters`, `users_online`, `users_spamTokens`) VALUES
(0, 'Default', 'Default1!', '0,6,-1', 1, 10),
(1, 'Banjoman64', 'werter@5S', '1,-1,-1', 0, 10),
(14, 'den', 'Rusty1!', '10,11,7', 0, 10),
(20, 'Banjo', 'werter@5S', '-1,-1,-1', 0, 10),
(21, 'Banjoman65', 'werter@5S', '9,-1,-1', 0, 10),
(22, 'Bovo', 'ASDFghjk1234#', '12,-1,-1', 0, 10);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `characters`
--
ALTER TABLE `characters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `races`
--
ALTER TABLE `races`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `characters`
--
ALTER TABLE `characters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `races`
--
ALTER TABLE `races`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
