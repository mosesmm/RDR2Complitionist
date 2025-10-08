export enum TaskCategory {
  MainStory = 'Main Story',
  Stranger = 'Stranger Missions',
  Challenge = 'Challenges',
  Collectible = 'Collectibles',
  Miscellaneous = 'Miscellaneous',
}

export type MainMission = {
  id: string;
  chapter: number;
  name: string;
  description: string;
  goldMedalObjectives: string[];
  category: TaskCategory.MainStory;
};

export type StrangerMission = {
  id: string;
  part: number;
  name: string;
  description: string;
  category: TaskCategory.Stranger;
};

export type Challenge = {
  id: string;
  challengeType: string;
  rank: number;
  description: string;
  category: TaskCategory.Challenge;
};

export type Collectible = {
  id: string;
  collectibleType: string;
  name: string;
  category: TaskCategory.Collectible;
};

export type Miscellaneous = {
  id: string;
  name: string;
  description: string;
  category: TaskCategory.Miscellaneous;
};

export type GameTask = MainMission | StrangerMission | Challenge | Collectible | Miscellaneous;
