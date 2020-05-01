-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 01, 2020 at 09:31 AM
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
  `firstName` varchar(255) NOT NULL DEFAULT 'New First Name',
  `lastName` varchar(255) NOT NULL DEFAULT 'New Last Name',
  `race` int(11) NOT NULL DEFAULT 0,
  `class` int(11) NOT NULL DEFAULT 0,
  `currentRoom` int(255) NOT NULL DEFAULT -1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `characters`
--

INSERT INTO `characters` (`id`, `firstName`, `lastName`, `race`, `class`, `currentRoom`) VALUES
(0, 'Default Character', '', 0, 0, -1),
(1, 'Fendryn', 'Telvanni', 1, 1, -1),
(5, 'Jeff', 'Barus', 0, 0, 0),
(6, 'Jeff', 'Barus', 0, 0, 0),
(7, 'deathwing', 'wing', 1, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'New Class',
  `attributeBonuses` varchar(255) NOT NULL DEFAULT '0,0,0,0,0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `attributeBonuses`) VALUES
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
  `name` varchar(255) DEFAULT 'New Race',
  `attributeBonuses` varchar(255) NOT NULL DEFAULT '0,0,0,0,0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `races`
--

INSERT INTO `races` (`id`, `name`, `attributeBonuses`) VALUES
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
  `roomName` varchar(255) NOT NULL DEFAULT 'newRoom',
  `roomDescription` varchar(1024) NOT NULL DEFAULT 'An empty room.',
  `north` int(11) NOT NULL DEFAULT -1,
  `east` int(11) DEFAULT -1,
  `south` int(11) NOT NULL DEFAULT -1,
  `west` int(11) NOT NULL DEFAULT -1,
  `playerList` varchar(1024) NOT NULL DEFAULT '{"playerList":[]}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `characters` varchar(1024) NOT NULL DEFAULT '-1,-1,-1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `characters`) VALUES
(0, 'Default', 'Default1!', '0,6,-1'),
(1, 'Banjoman64', 'werter@5S', '1,-1,-1'),
(14, 'den', 'Rusty1!', '-1,-1,7'),
(15, 'den2', 'Rusty1!', '-1,-1,-1');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
