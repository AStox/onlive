export type Resource = {
  name: string;
  type: string;
  value: number;
};

export const resourceTypes: { [key: string]: Resource } = {
  wood: { name: "wood", type: "WOOD", value: 1 },
  stone: { name: "stone", type: "STONE", value: 1 },
  herb: { name: "herb", type: "HERB", value: 2 },
  berry: { name: "berry", type: "BERRY", value: 1 },
  vegetable: { name: "vegetable", type: "VEGETABLE", value: 1 },
};
