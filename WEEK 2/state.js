export let state = {
  employees: [
    { id: 1, name: "John", score: 70, present: true },
    { id: 2, name: "Sara", score: 85, present: false }
  ],
  allEmployees: [
    { id: 1, name: "John", score: 70, present: true },
    { id: 2, name: "Sara", score: 85, present: false }
  ]
};

let listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

export function setState(newState) {
  state = { ...state, ...newState };

  // keep backup list updated
  if (newState.employees) {
    state.allEmployees = [...newState.employees];
  }

  listeners.forEach(l => l());
}