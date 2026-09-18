"use client";

import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  team: string;
  logo?: string;
  price: number;
  avg: number;
  bps: number;
  ser: number;
};

// Startpriser från föregående säsongs Elitserien-data.
// Testmodell: 30% SER + 30% BP/s + 25% AVG + 15% total BP.
// Priser 0,5–12,5 mkr i steg om 0,5 mkr.
const FANTASY_PLAYERS: Player[] = [
  { id: "M140796ROB01", name: "Robin Hultsten", team: "BK Kaskad", price: 12.5, avg: 217.11, bps: 0.65, ser: 80 },
  { id: "M011000TEO01", name: "Teodor Samuelsson", team: "BK Kaskad", price: 12.5, avg: 225.12, bps: 0.68, ser: 74 },
  { id: "M070280KAR01", name: "Karl Wahlgren", team: "IS Göta", price: 12.0, avg: 222.03, bps: 0.59, ser: 80 },
  { id: "M171004KEV01", name: "Kevin Melin", team: "AIK", price: 12.0, avg: 227.33, bps: 0.58, ser: 80 },
  { id: "M271287JAM01", name: "James Blomgren", team: "Team Alingsås BC", price: 11.5, avg: 226.90, bps: 0.61, ser: 72 },
  { id: "M160806ALB01", name: "Albin Lindberg", team: "Team Alingsås BC", price: 10.0, avg: 215.68, bps: 0.62, ser: 69 },
  { id: "M091007NOE01", name: "Noel Haglund Torgersen", team: "Team Alingsås BC", price: 11.0, avg: 224.42, bps: 0.58, ser: 74 },
  { id: "M140802WIL01", name: "William Berggren", team: "Team Clan Nässjö BK", price: 11.5, avg: 230.35, bps: 0.56, ser: 75 },
  { id: "M120504JOE01", name: "Joel Lothigius", team: "BK Kaskad", price: 9.5, avg: 206.83, bps: 0.54, ser: 78 },
  { id: "M290804IN%2001", name: "Alvin Kvarnström", team: "AIK", price: 11.0, avg: 222.55, bps: 0.53, ser: 80 },
  { id: "M111085RIC01", name: "Rickard Dahllöf", team: "Team Alingsås BC", price: 10.0, avg: 218.71, bps: 0.65, ser: 63 },
  { id: "M101005CAR01", name: "Carl Eklund", team: "IKW/Köping BK", price: 10.5, avg: 224.05, bps: 0.54, ser: 76 },
  { id: "M100892MAR02", name: "Marcus Tidbeck", team: "Stureby BK", price: 10.5, avg: 221.71, bps: 0.51, ser: 79 },
  { id: "M230204ROB01", name: "Robin Ilhammar", team: "Team Clan Nässjö BK", price: 10.5, avg: 229.29, bps: 0.57, ser: 68 },
  { id: "M310895FIL01", name: "Filip Wilhelmsson", team: "BK Kaskad", price: 9.5, avg: 216.03, bps: 0.54, ser: 72 },
  { id: "M290598KEV01", name: "Kevin Lindbladh", team: "Team Clan Nässjö BK", price: 10.5, avg: 238.03, bps: 0.64, ser: 59 },
  { id: "M270475PET01", name: "Peter Hellström", team: "Team Clan Nässjö BK", price: 10.0, avg: 219.78, bps: 0.49, ser: 77 },
  { id: "M091204ANT01", name: "Anton Andersson", team: "IS Göta", price: 10.0, avg: 218.70, bps: 0.48, ser: 80 },
  { id: "M120198ERI01", name: "Erik Hermansson", team: "IKW/Köping BK", price: 9.0, avg: 214.23, bps: 0.50, ser: 74 },
  { id: "M070399EMA01", name: "Emanuel Jonsson", team: "Team Alingsås BC", price: 9.0, avg: 214.87, bps: 0.48, ser: 77 },
  { id: "M150873TOM01", name: "Tommy Wendel", team: "Stureby BK", price: 10.0, avg: 225.71, bps: 0.47, ser: 78 },
  { id: "M010694JER01", name: "Jerry Ekman-Wogel", team: "Stureby BK", price: 9.5, avg: 226.85, bps: 0.60, ser: 60 },
  { id: "M230996VIK01", name: "Viktor Danielsson", team: "IKW/Köping BK", price: 9.5, avg: 221.96, bps: 0.47, ser: 77 },
  { id: "M240706EMI01", name: "Emil Svensson", team: "Team Clan Nässjö BK", price: 9.5, avg: 229.90, bps: 0.57, ser: 61 },
  { id: "M110396LUD01", name: "Ludwig Ingerskog", team: "Bodens BS", price: 8.5, avg: 213.47, bps: 0.49, ser: 72 },
  { id: "M201104JOE01", name: "Joel Johansson", team: "AIK", price: 8.5, avg: 217.85, bps: 0.56, ser: 61 },
  { id: "M290103ALE01", name: "Alex Joki", team: "Stureby BK", price: 9.5, avg: 222.29, bps: 0.44, ser: 78 },
  { id: "M061095PON01", name: "Pontus Andersson", team: "Team Clan Nässjö BK", price: 7.5, avg: 213.11, bps: 0.59, ser: 56 },
  { id: "M110387KIM01", name: "Kim Andersson", team: "BK Full House", price: 7.5, avg: 211.72, bps: 0.55, ser: 60 },
  { id: "M250690RAS01", name: "Rasmus Samuelsson", team: "BK Kaskad", price: 8.0, avg: 212.53, bps: 0.53, ser: 62 },
  { id: "M281209KEV01", name: "Kevin Vöcks Andersson", team: "BK Full House", price: 7.5, avg: 204.49, bps: 0.51, ser: 65 },
  { id: "M181201LUC01", name: "Lucas Fjällborg", team: "Team Alingsås BC", price: 8.5, avg: 217.85, bps: 0.44, ser: 75 },
  { id: "M110607WIL01", name: "Wilmer Kvarnström", team: "AIK", price: 8.5, avg: 216.18, bps: 0.43, ser: 77 },
  { id: "M020809PHI01", name: "Philip Strandgren", team: "Bodens BS", price: 8.5, avg: 209.33, bps: 0.41, ser: 80 },
  { id: "M010504BEN01", name: "Ben Robinson", team: "BK Full House", price: 7.5, avg: 215.50, bps: 0.57, ser: 56 },
  { id: "M220471MAR03", name: "Martin Paulsson", team: "IS Göta", price: 8.5, avg: 217.18, bps: 0.44, ser: 72 },
  { id: "M030879MAR03", name: "Martin Larsen", team: "Team Pergamon BC", price: 8.0, avg: 224.37, bps: 0.60, ser: 52 },
  { id: "M020197ALF01", name: "Alfred Berggren", team: "Team Clan Nässjö BK", price: 7.5, avg: 217.71, bps: 0.56, ser: 55 },
  { id: "M010599JOH01", name: "Johan Klyft", team: "BK Full House", price: 7.0, avg: 204.18, bps: 0.46, ser: 67 },
  { id: "M200602MAT01", name: "Mathias Grønne Ankerdal", team: "Team Pergamon BC", price: 8.5, avg: 230.10, bps: 0.63, ser: 48 },
  { id: "M050588RAY01", name: "Raymond Teece", team: "BK Full House", price: 7.5, avg: 217.46, bps: 0.58, ser: 52 },
  { id: "M280398EMI01", name: "Emil Holmberg", team: "Team Clan Nässjö BK", price: 8.0, avg: 222.39, bps: 0.54, ser: 56 },
  { id: "M010393MAR02", name: "Markus Jansson", team: "Team Pergamon BC", price: 8.0, avg: 223.34, bps: 0.51, ser: 59 },
  { id: "M171204FIL01", name: "Filip Wendel", team: "Stureby BK", price: 8.0, avg: 217.03, bps: 0.45, ser: 67 },
  { id: "M091005ROB01", name: "Robin Noberg", team: "Team Pergamon BC", price: 7.0, avg: 213.10, bps: 0.58, ser: 50 },
  { id: "M281093ELL01", name: "Elliot Crosby", team: "AIK", price: 7.0, avg: 212.76, bps: 0.46, ser: 63 },
  { id: "M290879DEN03", name: "Dennis Eklund", team: "Stureby BK", price: 7.5, avg: 216.90, bps: 0.46, ser: 63 },
  { id: "M060181PER01", name: "Per Sundqvist", team: "Bodens BS", price: 6.5, avg: 201.31, bps: 0.43, ser: 67 },
  { id: "M180991AXE01", name: "Axel Simonsson", team: "Bodens BS", price: 7.0, avg: 201.96, bps: 0.39, ser: 75 },
  { id: "M280507OSS01", name: "Ossian Kinnari", team: "IKW/Köping BK", price: 8.0, avg: 219.30, bps: 0.38, ser: 76 },
  { id: "M150295JES01", name: "Jesper Svensson", team: "Team Pergamon BC", price: 8.5, avg: 233.48, bps: 0.70, ser: 40 },
  { id: "M250485JOH01", name: "John Mattsson", team: "BK Full House", price: 6.0, avg: 201.72, bps: 0.53, ser: 53 },
  { id: "M240199ALE01", name: "Alexsander Flodin", team: "Team Alingsås BC", price: 7.0, avg: 219.51, bps: 0.51, ser: 55 },
  { id: "M260797TEE01", name: "Teemu Putkisto", team: "Bodens BS", price: 7.0, avg: 218.43, bps: 0.50, ser: 56 },
  { id: "M070998PON01", name: "Pontus Falkhäll", team: "Team Pergamon BC", price: 6.5, avg: 213.86, bps: 0.61, ser: 44 },
  { id: "M210394ARN01", name: "Arnar Jonsson", team: "IS Göta", price: 7.0, avg: 217.38, bps: 0.56, ser: 48 },
  { id: "M241100WIL02", name: "William Svensson", team: "Team Pergamon BC", price: 7.0, avg: 214.10, bps: 0.45, ser: 60 },
  { id: "M300102ALF01", name: "Alfred Odbert", team: "IKW/Köping BK", price: 7.5, avg: 213.61, bps: 0.35, ser: 77 },
  { id: "M230503LUK01", name: "Lukas Jelínek", team: "AIK", price: 8.0, avg: 238.43, bps: 0.59, ser: 44 },
  { id: "M161188GUS01", name: "Gustaf Johansson", team: "Team Alingsås BC", price: 6.5, avg: 213.29, bps: 0.53, ser: 49 },
  { id: "M171188EMI01", name: "Emil Ågren", team: "BK Kaskad", price: 6.0, avg: 204.02, bps: 0.48, ser: 54 },
  { id: "M150703ALE01", name: "Alexander Tigerstrand", team: "Team Clan Nässjö BK", price: 7.0, avg: 224.48, bps: 0.52, ser: 48 },
  { id: "M041090ROB01", name: "Robin Persson", team: "IS Göta", price: 6.0, avg: 207.38, bps: 0.50, ser: 50 },
  { id: "M070592ADA01", name: "Adam Andersson", team: "Bodens BS", price: 6.5, avg: 214.32, bps: 0.45, ser: 56 },
  { id: "M190580DAN01", name: "Daniel Rönnbäck", team: "Bodens BS", price: 6.0, avg: 205.28, bps: 0.44, ser: 57 },
  { id: "M301286MAX01", name: "Max Ornered", team: "Stureby BK", price: 6.5, avg: 212.57, bps: 0.38, ser: 65 },
  { id: "M051281AND01", name: "Anders Andersson", team: "IS Göta", price: 6.0, avg: 205.58, bps: 0.38, ser: 66 },
  { id: "M120206ZAK01", name: "Zakarias Lindqvist", team: "Team Pergamon BC", price: 6.5, avg: 219.40, bps: 0.56, ser: 43 },
  { id: "M100880MIK02", name: "Mikael Wik", team: "BK Kaskad", price: 5.0, avg: 194.02, bps: 0.55, ser: 44 },
  { id: "M210504ELL01", name: "Elliot Moulin", team: "BK Kaskad", price: 5.5, avg: 206.15, bps: 0.51, ser: 47 },
  { id: "M170907FEL01", name: "Felix Möller", team: "Stureby BK", price: 6.0, avg: 211.92, bps: 0.47, ser: 51 },
  { id: "M010768IAN01", name: "Ian Robinson", team: "AIK", price: 5.5, avg: 208.00, bps: 0.45, ser: 53 },
  { id: "M050592ANT01", name: "Anton Persson", team: "Team Clan Nässjö BK", price: 6.0, avg: 222.05, bps: 0.50, ser: 44 },
  { id: "M070305DAN01", name: "Dan Harding", team: "IS Göta", price: 5.5, avg: 213.84, bps: 0.45, ser: 49 },
  { id: "M200189MAT01", name: "Mattias Wetterberg", team: "Team Pergamon BC", price: 6.5, avg: 228.07, bps: 0.70, ser: 30 },
  { id: "M200589JOH01", name: "Johan de Neergaard", team: "BK Full House", price: 4.5, avg: 198.03, bps: 0.57, ser: 37 },
  { id: "M060178JIM02", name: "J-D. Mortensen", team: "BK Full House", price: 5.5, avg: 212.33, bps: 0.53, ser: 40 },
  { id: "M200802TIM01", name: "Timmie Ahl", team: "Team Pergamon BC", price: 5.5, avg: 216.90, bps: 0.50, ser: 42 },
  { id: "M141108WIL01", name: "William Clasborn", team: "Team Alingsås BC", price: 5.5, avg: 217.58, bps: 0.49, ser: 43 },
  { id: "M240196OLL01", name: "O-P. Pajari", team: "Bodens BS", price: 4.5, avg: 201.32, bps: 0.45, ser: 47 },
  { id: "M250872TON01", name: "Tony Eklund", team: "IKW/Köping BK", price: 5.5, avg: 210.08, bps: 0.42, ser: 50 },
  { id: "M080507TOM01", name: "Tomo Pinteric", team: "IS Göta", price: 5.0, avg: 205.10, bps: 0.40, ser: 52 },
  { id: "M251090CHR01", name: "Christopher Lüttke", team: "BK Kaskad", price: 5.0, avg: 207.00, bps: 0.56, ser: 36 },
  { id: "M160882MAR01", name: "Marcus Karlsson", team: "IKW/Köping BK", price: 5.5, avg: 220.25, bps: 0.68, ser: 28 },
  { id: "M291205ALB01", name: "Albin Gullstrand", team: "Team Pergamon BC", price: 5.5, avg: 227.20, bps: 0.51, ser: 35 },
  { id: "M260795MIK01", name: "Mikkel Sørensen", team: "BK Full House", price: 4.5, avg: 210.00, bps: 0.50, ser: 36 },
  { id: "M020406EMI01", name: "Emil Back", team: "IS Göta", price: 4.5, avg: 205.50, bps: 0.50, ser: 36 },
  { id: "M010190RIC01", name: "Richard Teece", team: "BK Full House", price: 5.0, avg: 219.90, bps: 0.45, ser: 40 },
  { id: "M130402OLI01", name: "Oliver Dahlgren", team: "Team Pergamon BC", price: 5.5, avg: 225.02, bps: 0.39, ser: 46 },
  { id: "M260496JUH01", name: "Juho Rissanen", team: "IKW/Köping BK", price: 5.0, avg: 220.47, bps: 0.57, ser: 30 },
  { id: "M061189JOA01", name: "Joachim Karlsson", team: "IS Göta", price: 4.5, avg: 211.22, bps: 0.53, ser: 32 },
  { id: "M210607JUS01", name: "Jussi Laine", team: "IKW/Köping BK", price: 5.5, avg: 224.45, bps: 0.43, ser: 40 },
  { id: "M131209ESK01", name: "Eskil Lind", team: "BK Full House", price: 4.0, avg: 200.88, bps: 0.29, ser: 51 },
  { id: "M210401JON01", name: "Jonathan Hallberg", team: "Team Clan Nässjö BK", price: 4.0, avg: 211.52, bps: 0.48, ser: 29 },
  { id: "M271208ERI01", name: "Erik Larsson", team: "Team Pergamon BC", price: 5.0, avg: 226.63, bps: 0.44, ser: 32 },
  { id: "M260396ANT04", name: "Anton Gehlin", team: "AIK", price: 4.0, avg: 204.52, bps: 0.32, ser: 44 },
  { id: "M011191MIK01", name: "Mik Stampe", team: "BK Full House", price: 4.5, avg: 214.00, bps: 0.65, ser: 20 },
  { id: "M080598TIM01", name: "Tim Stampe", team: "BK Full House", price: 4.0, avg: 208.38, bps: 0.54, ser: 24 },
  { id: "M200502PYR01", name: "Pyry Puharinen", team: "Bodens BS", price: 3.5, avg: 203.40, bps: 0.52, ser: 25 },
  { id: "M240404HEN01", name: "Henrik Nordang Larsen", team: "Team Alingsås BC", price: 4.0, avg: 208.63, bps: 0.63, ser: 19 },
  { id: "M240593JAR01", name: "Jaroslav Lorenc", team: "AIK", price: 4.5, avg: 220.35, bps: 0.60, ser: 20 },
  { id: "M140400MAR01", name: "Markus Lenefjäll", team: "BK Kaskad", price: 4.0, avg: 215.78, bps: 0.52, ser: 23 },
  { id: "M010806MAR01", name: "Markus Lahti", team: "Stureby BK", price: 3.5, avg: 209.94, bps: 0.39, ser: 31 },
  { id: "M010692TOB01", name: "Tobias Börding", team: "AIK", price: 3.5, avg: 210.95, bps: 0.55, ser: 20 },
  { id: "M121094ALE01", name: "Alexander Johansson", team: "BK Full House", price: 4.5, avg: 219.93, bps: 0.71, ser: 14 },
  { id: "M140936HED01", name: "Hadley Morgan", team: "AIK", price: 4.0, avg: 221.00, bps: 0.50, ser: 20 },
  { id: "M021097JEN01", name: "Jens Värnberg", team: "Bodens BS", price: 2.5, avg: 194.48, bps: 0.48, ser: 21 },
  { id: "M250609HUG01", name: "Hugo Johansson", team: "IKW/Köping BK", price: 2.5, avg: 194.82, bps: 0.45, ser: 22 },
  { id: "M250489MAT01", name: "Mats Maggi", team: "Stureby BK", price: 3.0, avg: 211.09, bps: 0.45, ser: 22 },
  { id: "M141290ALE01", name: "Alexander Larsson", team: "Team Pergamon BC", price: 3.0, avg: 201.48, bps: 0.43, ser: 23 },
  { id: "M231194JOH02", name: "Johannes Granström", team: "Bodens BS", price: 3.0, avg: 204.52, bps: 0.30, ser: 33 },
  { id: "M300595JOA03", name: "Joakim West", team: "Team Alingsås BC", price: 3.0, avg: 205.50, bps: 0.28, ser: 36 },
  { id: "M160108M%C3%85N01", name: "Månz Friberg", team: "IS Göta", price: 3.5, avg: 205.07, bps: 0.64, ser: 14 },
  { id: "M300785DOM01", name: "Dominic Barrett", team: "AIK", price: 3.5, avg: 216.00, bps: 0.56, ser: 16 },
  { id: "M100203FEL01", name: "Felix Bergman", team: "BK Kaskad", price: 3.0, avg: 205.89, bps: 0.47, ser: 19 },
  { id: "M170689KIM01", name: "Kim Lindström", team: "Bodens BS", price: 2.5, avg: 193.75, bps: 0.25, ser: 36 },
  { id: "M070901TOB01", name: "Tobias Hogdin", team: "Team Pergamon BC", price: 4.0, avg: 223.67, bps: 0.67, ser: 12 },
  { id: "M010501LUU01", name: "Luukas Väänänen", team: "BK Kaskad", price: 3.5, avg: 220.81, bps: 0.50, ser: 16 },
  { id: "M060479ROB01", name: "Rob Thurlby", team: "AIK", price: 2.5, avg: 203.43, bps: 0.38, ser: 21 },
  { id: "M181200KEV01", name: "Kevin Tapper", team: "IKW/Köping BK", price: 3.0, avg: 218.07, bps: 0.50, ser: 14 },
  { id: "M200192ANT01", name: "Anton Pennerborn", team: "IKW/Köping BK", price: 2.0, avg: 191.00, bps: 0.47, ser: 15 },
  { id: "M111105AXE01", name: "Axel Gustafsson", team: "BK Kaskad", price: 2.5, avg: 195.40, bps: 0.47, ser: 15 },
  { id: "M240394CHR01", name: "Christopher Sloan", team: "IS Göta", price: 3.0, avg: 218.31, bps: 0.44, ser: 16 },
  { id: "M081107EMI01", name: "Emil Löfström", team: "Stureby BK", price: 2.5, avg: 202.58, bps: 0.37, ser: 19 },
  { id: "M060310LAS01", name: "Lasse Thomsen", team: "Team Pergamon BC", price: 4.0, avg: 238.67, bps: 0.50, ser: 12 },
  { id: "M201283JOH01", name: "John Gustavsson", team: "BK Full House", price: 2.5, avg: 207.94, bps: 0.38, ser: 16 },
  { id: "M250493CAR03", name: "C-O. Palmér", team: "Team Clan Nässjö BK", price: 3.0, avg: 206.63, bps: 0.63, ser: 8 },
  { id: "M110108VIK01", name: "Viktor Backe", team: "IS Göta", price: 2.5, avg: 200.60, bps: 0.50, ser: 10 },
  { id: "M040194JOR01", name: "Jord Van Weeren", team: "IS Göta", price: 3.0, avg: 221.00, bps: 0.42, ser: 12 },
  { id: "M230403RAM01", name: "Rami Mukkula", team: "IKW/Köping BK", price: 3.0, avg: 224.13, bps: 0.31, ser: 16 },
  { id: "M241070JON01", name: "Jonas Andersson", team: "AIK", price: 2.0, avg: 203.38, bps: 0.31, ser: 16 },
  { id: "M290499JAR01", name: "Jarno Lahti", team: "BK Kaskad", price: 2.5, avg: 218.25, bps: 0.31, ser: 16 },
  { id: "M260397KAA01", name: "Kaaron Salomaa", team: "Stureby BK", price: 2.0, avg: 198.88, bps: 0.50, ser: 8 },
  { id: "M190406KAL01", name: "Kallum Peach", team: "IKW/Köping BK", price: 1.5, avg: 187.89, bps: 0.44, ser: 9 },
  { id: "M181006LEO01", name: "Leo Norgren", team: "IKW/Köping BK", price: 2.0, avg: 208.68, bps: 0.21, ser: 19 },
  { id: "M070589MAT01", name: "Mattias Kolerud", team: "Stureby BK", price: 2.0, avg: 200.57, bps: 0.43, ser: 7 },
  { id: "M131272VES01", name: "Vesa Rontti", team: "IKW/Köping BK", price: 1.5, avg: 183.25, bps: 0.38, ser: 8 },
  { id: "M180898ROB01", name: "Robert Lindberg", team: "Team Pergamon BC", price: 2.0, avg: 217.27, bps: 0.27, ser: 11 },
  { id: "M020369PER01", name: "Per Jansson", team: "Stureby BK", price: 1.5, avg: 201.27, bps: 0.27, ser: 11 },
  { id: "M290907TOB01", name: "Tobias Bryde", team: "IS Göta", price: 2.5, avg: 230.83, bps: 0.25, ser: 12 },
  { id: "M110201VIK01", name: "Viktor Brentebråten Mortensen", team: "AIK", price: 1.5, avg: 190.77, bps: 0.23, ser: 13 },
  { id: "M180295ANT01", name: "Anton Ahlgren", team: "Team Clan Nässjö BK", price: 2.0, avg: 200.50, bps: 0.50, ser: 4 },
  { id: "M090607EMI01", name: "Emil Karlsson", team: "Team Alingsås BC", price: 1.0, avg: 186.38, bps: 0.25, ser: 8 },
  { id: "M120989RIC01", name: "Rickard Ryding", team: "Bodens BS", price: 1.0, avg: 180.13, bps: 0.25, ser: 8 },
  { id: "M300791ROB01", name: "Robin Björnstedt", team: "IS Göta", price: 1.0, avg: 188.50, bps: 0.25, ser: 8 },
  { id: "M140984OLA01", name: "Ola Persson", team: "BK Full House", price: 1.5, avg: 200.00, bps: 0.22, ser: 9 },
  { id: "M181183OSK01", name: "Osku Palermaa", team: "Team Pergamon BC", price: 3.0, avg: 183.00, bps: 1.00, ser: 1 },
  { id: "M170686JOA01", name: "Joakim Johansson", team: "IKW/Köping BK", price: 1.5, avg: 191.00, bps: 0.50, ser: 2 },
  { id: "M040497GUS01", name: "Gustav Nilsson", team: "IS Göta", price: 1.0, avg: 171.33, bps: 0.33, ser: 3 },
  { id: "M010375HEN01", name: "Henrik Sundqvist", team: "Bodens BS", price: 1.0, avg: 175.67, bps: 0.33, ser: 3 },
  { id: "M220494DEN01", name: "Dennis Rödin", team: "BK Kaskad", price: 0.5, avg: 161.00, bps: 0.25, ser: 4 },
  { id: "M240305RON01", name: "Roni Leskinen", team: "AIK", price: 1.5, avg: 207.75, bps: 0.25, ser: 4 },
  { id: "M031204SII01", name: "Siim Saar", team: "IKW/Köping BK", price: 1.0, avg: 202.00, bps: 0.20, ser: 5 },
  { id: "M111106FRA01", name: "Frank Stephensen", team: "AIK", price: 1.5, avg: 216.25, bps: 0.13, ser: 8 },
  { id: "M231194EMI02", name: "Emil Fahlén", team: "IKW/Köping BK", price: 0.5, avg: 174.00, bps: 0.00, ser: 2 },
  { id: "M080663TOM01", name: "Tommy Petersén", team: "Bodens BS", price: 0.5, avg: 180.00, bps: 0.00, ser: 4 },
  { id: "M190108TOB01", name: "Tobias Andersson", team: "Stureby BK", price: 0.5, avg: 168.00, bps: 0.00, ser: 1 },
];

const START_BUDGET = 50;
const MAX_PLAYERS = 8;
const MAX_FROM_TEAM = 2;

export default function FantasyPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("Alla");

  const selected = useMemo(
    () => selectedIds.map((id) => FANTASY_PLAYERS.find((p) => p.id === id)).filter(Boolean) as Player[],
    [selectedIds]
  );

  const spent = selected.reduce((sum, p) => sum + p.price, 0);
  const remaining = START_BUDGET - spent;

  const teams = ["Alla", ...Array.from(new Set(FANTASY_PLAYERS.map((p) => p.team)))];

  const visiblePlayers = FANTASY_PLAYERS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (teamFilter === "Alla" || p.team === teamFilter)
  ).sort((a, b) => b.price - a.price);

  function teamCount(team: string) {
    return selected.filter((p) => p.team === team).length;
  }

  function addPlayer(player: Player) {
    if (selectedIds.includes(player.id)) return;
    if (selected.length >= MAX_PLAYERS) return;
    if (player.price > remaining) return;
    if (teamCount(player.team) >= MAX_FROM_TEAM) return;
    setSelectedIds((prev) => [...prev, player.id]);
  }

  function removePlayer(id: string) {
    setSelectedIds((prev) => prev.filter((playerId) => playerId !== id));
  }

  return (
    <main style={styles.page}>
      <div style={styles.glow} />
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.badge}>BP FANTASY</div>
            <h1 style={styles.h1}>Bygg ditt lag.</h1>
            <p style={styles.lead}>
              Bygg ditt Fantasy-lag med spelare från Elitserien. Du startar med 50,0 mkr och får välja max 2 spelare från samma klubb.
            </p>
          </div>
          <div style={styles.deadline}>
            <span style={styles.muted}>Deadline</span>
            <strong>Fredag 18:00</strong>
          </div>
        </header>

        <section style={styles.summaryGrid}>
          <Stat label="Spelare" value={`${selected.length}/8`} />
          <Stat label="Budget kvar" value={`${remaining.toFixed(1)} mkr`} yellow />
          <Stat label="Lagvärde" value={`${spent.toFixed(1)} mkr`} />
          <Stat label="Max / klubb" value="2" />
        </section>

        <div style={styles.columns}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.eyebrow}>MITT LAG</div>
                <h2 style={styles.h2}>{selected.length === 8 ? "8/8 – laget är komplett" : `${selected.length}/8 valda · ${8 - selected.length} platser kvar`}</h2>
              </div>
              <button
                disabled={selected.length === 0}
                onClick={() => {
                  if (window.confirm("Vill du rensa hela laget?")) setSelectedIds([]);
                }}
                style={{ ...styles.ghostButton, opacity: selected.length === 0 ? 0.45 : 1 }}
              >
                Rensa hela laget
              </button>
            </div>

            <div style={styles.squad}>
              {Array.from({ length: MAX_PLAYERS }).map((_, index) => {
                const player = selected[index];
                return player ? (
                  <button key={player.id} onClick={() => removePlayer(player.id)} style={styles.slotFilled}>
                    <div style={styles.slotNumber}>{index + 1}</div>
                    <div style={{ minWidth: 0, flex: 1, textAlign: "left" }}>
                      <div style={styles.playerName}>{player.name}</div>
                      <div style={styles.playerMeta}>{player.team}</div>
                    </div>
                    <div style={styles.price}>{player.price.toFixed(1)}</div>
                    <div style={styles.remove}>×</div>
                  </button>
                ) : (
                  <div key={index} style={styles.slotEmpty}>
                    <div style={styles.slotNumber}>{index + 1}</div>
                    <span>Ledig plats</span>
                  </div>
                );
              })}
            </div>

            <div style={styles.infoBox}>
              <strong style={{ color: "#facc15" }}>Spelarvärden förändras under säsongen.</strong>
              <span> 1 Fantasy-poäng = ±10 000 kr. Spelar man inte lagets match: −50 000 kr.</span>
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <div style={styles.eyebrow}>TRANSFERMARKNAD</div>
                <h2 style={styles.h2}>Spelare</h2>
              </div>
            </div>

            <div style={styles.filters}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sök spelare..."
                style={styles.input}
              />
              <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} style={styles.input}>
                {teams.map((team) => <option key={team}>{team}</option>)}
              </select>
            </div>

            <div style={styles.market}>
              {visiblePlayers.map((player) => {
                const isSelected = selectedIds.includes(player.id);
                const teamFull = teamCount(player.team) >= MAX_FROM_TEAM;
                const tooExpensive = player.price > remaining;
                const disabled = isSelected || selected.length >= MAX_PLAYERS || teamFull || tooExpensive;

                return (
                  <div key={player.id} style={styles.marketRow}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={styles.playerName}>{player.name}</div>
                      <div style={styles.playerMeta}>
                        {player.team} · AVG {player.avg.toFixed(2)} · BP/s {player.bps.toFixed(2)} · {player.ser} SER
                      </div>
                    </div>
                    <div style={styles.marketPrice}>{player.price.toFixed(1)} mkr</div>
                    <button
                      disabled={disabled}
                      onClick={() => addPlayer(player)}
                      style={{ ...styles.addButton, ...(disabled ? styles.addButtonDisabled : {}) }}
                    >
                      {isSelected ? "Vald" : "+"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div style={styles.bottomBar}>
          <div>
            <div style={styles.muted}>Ditt lag</div>
            <strong>{selected.length}/8 spelare · {remaining.toFixed(1)} mkr kvar</strong>
          </div>
          <button disabled={selected.length !== 8} style={{ ...styles.saveButton, ...(selected.length !== 8 ? styles.saveDisabled : {}) }}>
            Spara lag
          </button>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, yellow = false }: { label: string; value: string; yellow?: boolean }) {
  return (
    <div style={styles.stat}>
      <div style={styles.muted}>{label}</div>
      <div style={{ ...styles.statValue, color: yellow ? "#facc15" : "white" }}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#000", color: "white", fontFamily: "Arial, sans-serif", padding: "16px", position: "relative", overflowX: "clip" },
  glow: { position: "absolute", width: 700, height: 380, top: -180, left: "50%", transform: "translateX(-50%)", background: "rgba(250,204,21,.16)", filter: "blur(120px)", pointerEvents: "none" },
  shell: { maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1, paddingBottom: 110 },
  hero: { display: "flex", justifyContent: "space-between", gap: 24, alignItems: "flex-end", padding: "28px", border: "1px solid rgba(250,204,21,.28)", borderRadius: 28, background: "linear-gradient(135deg,rgba(24,24,27,.96),rgba(2,6,23,.97))", boxShadow: "0 0 70px rgba(250,204,21,.1)", flexWrap: "wrap" },
  badge: { display: "inline-block", color: "#facc15", background: "rgba(250,204,21,.12)", border: "1px solid rgba(250,204,21,.35)", borderRadius: 999, padding: "8px 12px", fontWeight: 900, fontSize: 13, letterSpacing: 1 },
  h1: { fontSize: "clamp(34px,7vw,58px)", margin: "18px 0 8px", lineHeight: .95, fontWeight: 950 },
  lead: { color: "#94a3b8", maxWidth: 650, lineHeight: 1.5, margin: 0 },
  deadline: { display: "grid", gap: 5, padding: "14px 18px", borderRadius: 16, background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.2)" },
  muted: { color: "#64748b", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5 },
  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10, marginTop: 16 },
  stat: { background: "rgba(15,23,42,.82)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, padding: 16 },
  statValue: { fontSize: 24, fontWeight: 950, marginTop: 5 },
  columns: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))", gap: 16, marginTop: 16, alignItems: "start" },
  panel: { background: "rgba(15,23,42,.78)", border: "1px solid rgba(250,204,21,.14)", borderRadius: 22, padding: 18 },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  eyebrow: { color: "#facc15", fontWeight: 950, fontSize: 11, letterSpacing: 1 },
  h2: { margin: "4px 0 0", fontSize: 22 },
  ghostButton: { background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "8px 11px", cursor: "pointer" },
  squad: { display: "grid", gap: 7 },
  slotFilled: { width: "100%", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(250,204,21,.2)", background: "rgba(250,204,21,.06)", color: "white", borderRadius: 13, padding: "10px", cursor: "pointer" },
  slotEmpty: { display: "flex", alignItems: "center", gap: 10, minHeight: 47, border: "1px dashed #334155", color: "#64748b", borderRadius: 13, padding: "10px" },
  slotNumber: { width: 27, height: 27, display: "grid", placeItems: "center", borderRadius: 8, background: "#111827", color: "#facc15", fontSize: 12, fontWeight: 950, flexShrink: 0 },
  playerName: { fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  playerMeta: { color: "#64748b", fontSize: 11, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  price: { color: "#facc15", fontWeight: 950, fontSize: 13 },
  remove: { color: "#64748b", fontSize: 20 },
  infoBox: { marginTop: 14, padding: 13, borderRadius: 13, background: "rgba(255,255,255,.035)", color: "#94a3b8", fontSize: 12, lineHeight: 1.5 },
  filters: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8, marginBottom: 12 },
  input: { width: "100%", boxSizing: "border-box", background: "#111827", color: "white", border: "1px solid #334155", borderRadius: 11, padding: "11px 12px", outline: "none" },
  market: { display: "grid", gap: 7, maxHeight: 620, overflowY: "auto" },
  marketRow: { display: "flex", alignItems: "center", gap: 10, padding: 10, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.055)", borderRadius: 13 },
  marketPrice: { color: "#facc15", fontWeight: 950, fontSize: 13, whiteSpace: "nowrap" },
  addButton: { width: 38, height: 38, borderRadius: 11, border: 0, background: "#facc15", color: "#000", fontSize: 20, fontWeight: 950, cursor: "pointer" },
  addButtonDisabled: { background: "#1e293b", color: "#64748b", cursor: "not-allowed", fontSize: 11 },
  bottomBar: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, width: "min(calc(100% - 28px),900px)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 18, background: "rgba(2,6,23,.94)", backdropFilter: "blur(16px)", border: "1px solid rgba(250,204,21,.24)", boxShadow: "0 12px 50px rgba(0,0,0,.55)", zIndex: 20 },
  saveButton: { border: 0, borderRadius: 12, padding: "12px 18px", background: "#facc15", color: "#000", fontWeight: 950, cursor: "pointer" },
  saveDisabled: { background: "#1e293b", color: "#64748b", cursor: "not-allowed" },
};
