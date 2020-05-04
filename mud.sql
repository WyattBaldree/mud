-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 04, 2020 at 04:39 PM
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
(6, 'Jeff', 'Barus', 0, 0, 1),
(7, 'deathwing', 'wing', 1, 0, 1),
(9, 'Banjo', 'Man', 0, 0, 0);

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
(0, 'testRoom', 'You stand in the center of a large dimly lit room. You see an exit to the north.', 1, -1, -1, -1, '9,'),
(1, 'Town Square', 'You enter the town square. You see a strange room to the south.', -1, -1, 0, -1, '7,0,6,1,');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `users_username` varchar(255) NOT NULL,
  `users_password` varchar(255) NOT NULL,
  `users_characters` varchar(1024) NOT NULL DEFAULT '-1,-1,-1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `users_username`, `users_password`, `users_characters`) VALUES
(0, 'Default', 'Default1!', '0,6,-1'),
(1, 'Banjoman64', 'werter@5S', '1,-1,-1'),
(14, 'den', 'Rusty1!', '-1,-1,7'),
(20, 'Banjo', 'werter@5S', '-1,-1,-1'),
(21, 'Banjoman65', 'werter@5S', '9,-1,-1');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
