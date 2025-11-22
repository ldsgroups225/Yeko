import { SubjectData, SubjectCategory } from "../drizzle/core-schema";

const categories = {
  scientifique: "Scientifique" as SubjectCategory,
  litteraire: "Littéraire" as SubjectCategory,
  sportif: "Sportif" as SubjectCategory,
  autre: "Autre" as SubjectCategory,
};

export const subjectsData: SubjectData[] = [
  { name: "Mathématiques", shortName: "Maths", category: categories.scientifique },
  { name: "Physique-Chimie", shortName: "PC", category: categories.scientifique },
  { name: "SVT", shortName: "SVT", category: categories.scientifique },
  { name: "Français", shortName: "FR", category: categories.litteraire },
  { name: "Anglais", shortName: "ANG", category: categories.litteraire },
  { name: "Histoire-Géographie", shortName: "HG", category: categories.litteraire },
  { name: "EPS", shortName: "EPS", category: categories.sportif },
  { name: "Informatique", shortName: "INFO", category: categories.autre },
  { name: "Musique", shortName: "MUS", category: categories.autre },
  { name: "Art Plastique", shortName: "AP", category: categories.autre },
  { name: "Espagnol", shortName: "ESP", category: categories.litteraire },
  { name: "Allemand", shortName: "ALL", category: categories.litteraire },
]
