const MEAL_TYPE_MAP = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export function normalizeMealType(type) {
  if (!type) return type;
  return MEAL_TYPE_MAP[type.toLowerCase()] || type;
}
